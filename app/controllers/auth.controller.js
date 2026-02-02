const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Property = db.properties;
const responseModel = require("../models/response.model");
const otp_table = db.otp;
const { parseISO, differenceInMinutes } = require("date-fns");

const Op = db.Sequelize.Op;

// #################################################
//  twilio var
// #################################################

const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);


var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { Console } = require("console");
const { uniqueOTPCompo } = require("../components/unique_otp_compo");
const { default: axios } = require("axios");
const { where } = require("sequelize");
const { ConversationRelay } = require("twilio/lib/twiml/VoiceResponse");

// exports.signup = (req, res) => {
//   // Save User to Database
//   User.create({
//     username: req.body.username,
//     mobile_no: req.body.mobile_no,
//     email: req.body.email,
//     password: bcrypt.hashSync(req.body.password, 8),
//     re_password: req.body.re_password,
//     address_1: req.body.address_1,
//     address_2: req.body.address_2,
//     city: req.body.city,
//     state_id: req.body.state_id,
//     zip_code: req.body.zip_code,
//     emp_id: req.body.emp_id,
//     status: req.body.status,
//     user_role: req.body.user_role,
//     property_id: req.body.property_id ? req.body.property_id : null,
//     department_id: req.body.department_id ? req.body.department_id : null


//   })
//     .then(user => {
//       if (req.body.roles) {
//         Role.findAll({
//           where: {
//             name: {
//               [Op.or]: req.body.roles
//             }
//           }
//         }).then(roles => {
//           user.setRoles(roles).then(() => {
//             res.status(200).send({ message: "success" });
//           });
//         });
//       } else {
//         // user role = 1
//         user.setRoles([1]).then(() => {
//           res.status(200).send({ message: "success" });
//         });
//       }
//     })
//     .catch(err => {
//       res.status(500).send({ message: err.message });
//     });
// };

exports.signup = async (req, res) => {
  try {

    const deCodedPass = bcrypt.hashSync(req.body.password, 8);

    // Create user
    const user = await User.create({
      username: req.body.username,
      mobile_no: req.body.mobile_no,
      email: req.body.email,
      password: deCodedPass,
      re_password: deCodedPass,
      address_1: req.body.address_1,
      address_2: req.body.address_2,
      city: req.body.city,
      state_id: req.body.state_id,
      zip_code: req.body.zip_code,
      emp_id: req.body.emp_id,
      status: req.body.status,
      user_role: req.body.user_role,
      property_id: req.body.property_id ? req.body.property_id : null,
      department_id: req.body.department_id ? req.body.department_id : null,
    });

    // Assign roles if provided
    if (req.body.roles) {
      const roles = await Role.findAll({
        where: { name: { [Op.or]: req.body.roles } },
      });
      await user.setRoles(roles);
    } else {
      await user.setRoles([1]);
    }

    // If property_id is provided, update user_role in the properties table
    if (req.body.property_id) {
      const property = await Property.findOne({
        where: { id: req.body.property_id },
      });

      if (property) {
        property.user_role = user.id; // Assign user ID to user_role
        await property.save();
      }
    }

    res.status(200).send({ message: "success" });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).send({ message: error.message });
  }
};

// ##############################################################
// sign in controller
// ##############################################################
exports.signin = async (req, res) => {

  const { device_tag } = req.body;

  try {

    if (device_tag !== "MOBILE" || device_tag === undefined) {

      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(404).send({ message: "username and password are required.", isError: true, });
      }


      const user = await User.findOne({ where: { username: req.body.username } });

      if (!user) {
        return res.status(404).send({ message: "User Not found.", isError: true, });
      }

      const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

      if (!passwordIsValid) {
        return res.status(401).send({ accessToken: null, message: "Invalid Password!", isError: true, });
      }

      if (user.user_role != 3) {
        return res.status(401).send({ accessToken: null, message: "You do not have admin privileges to access this.", isError: true, });
      }




      const roles = await user.getRoles();

      const authorities = roles.map(role => "ROLE_" + role.name.toUpperCase())[0];

      const token = jwt.sign(
        {
          id: user.id,
          userName: user.username,
          roles: authorities,
        },
        config.secret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400, // 24 hours
        }
      );


      return res.status(200).send({
        id: user.id,
        username: user?.username,
        email: user?.email,
        roles: authorities,
        accessToken: token,
        isError: false,
        message: ''
      });

    } else if (device_tag === "MOBILE") {

      const { mobile_no, device_id } = req.body;

      if (!mobile_no || !device_id) {
        return res.status(404).send({ message: "mobile_no and device_id are required", isError: true, });

      }


      const user = await User.findOne({ where: { mobile_no } });

      if (!user) {
        return res.status(404).send({ message: "User Not found.", isError: true, });
      }

      await User.update({ device_id }, {
        where: { mobile_no }
      });


      // to get unique otp   

      const otp = await uniqueOTPCompo(user?.id, mobile_no);


      // to send the otp 

      // await client.messages.create({
      //   body: `Your OTP is: ${otp}`,
      //   from: twilioPhone,
      //   // to: "+917358495594",
      //   to: `+91${mobile_no}`,
      // });

      await axios.post(`http://text.messagewall.in/api/smsapi?key=9be5cacf7c1cebe704fa31b0e38a6906&route=2&sender=THEMSG&number=${mobile_no}&templateid=1207161881764124563&sms=Your OTP is ${otp} IMMSMS`);


      return res.status(201).send({
        mobile_no: mobile_no,
        message: "OTP sended successfully",
        isError: false,
        // user,
      });

    }

  } catch (err) {
    console.log("error log on signin controller:", err);
    res.status(500).send({
      isError: true,
      message: err.message
    });
  }

};


// ##############################################################
// verify user controller
// ##############################################################

exports.verifyUser = async (req, res) => {

  try {

    const { otp, mobile_no } = req.body;

    if (!otp || !mobile_no) {
      return res.status(404).json({
        isError: true,
        message: "otp or mobile number are required",
      });
    }


    const user = await User.findOne({

      where: { mobile_no: mobile_no }
    });

    const onCheckOtp = await otp_table.findOne({
      where: { phone_number: mobile_no, user_id: user?.id },
      order: [['createdAt', 'DESC']],
    });


    // console.log("data:", onCheckOtp.otp, otp, onCheckOtp.otp == otp, onCheckOtp.otp === otp );

    if (onCheckOtp.otp !== otp) {

      return res.status(401).json({
        isError: true,
        message: "Invalid OTP",
      });
    }

    const otpCreatedDate = new Date(onCheckOtp?.createdAt);

    const convertedOtpCreatedDate = parseISO(otpCreatedDate.toISOString());

    const currentDate = new Date();

    const onCompareTime = differenceInMinutes(currentDate, convertedOtpCreatedDate);

    if (onCompareTime <= 500) {

      const roles = await db.role.findOne({ where: { id: user?.user_role } });



      const authorities = "ROLE_" + roles.name.toUpperCase();

      const token = jwt.sign(
        {
          id: user.id,
          userName: user.username,
          roles: authorities,
        },
        config.secret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400, // 24 hours
        }
      );


      return res.status(200).send({
        id: user.id,
        username: user?.username,
        email: user?.email,
        roles: authorities,
        accessToken: token,
        isError: false,
        message: 'OTP Verified.',
        mobile_no: mobile_no,
        // user
      });

      // return res.status(200).json({
      //   isError: false,
      //   message: "OTP verified."
      // });

    } else {



      return res.status(401).json({
        isError: true,
        message: "The provided OTP has expired. Please request a new one.",
      });

    }

  } catch (err) {
    console.log("error log on verify-user controller:", err);
    res.status(500).send({
      isError: true,
      message: err.message
    });
  }

}

// ##############################################################
// resend otp controller
// ##############################################################

exports.resendOtp = async (req, res) => {

  try {

    const { mobile_no } = req.body;


    if (!mobile_no) {
      return res.status(404).json({
        isError: true,
        message: "mobile number is required",
      });
    }

    const user = await User.findOne({ where: { mobile_no: mobile_no } });

    // to get unique otp   

    const otp = await uniqueOTPCompo(user?.id, mobile_no);

    // to send the otp 

    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: twilioPhone,
      // to: "+917358495594",
      to: `+91${mobile_no}`,
    });

    return res.status(201).json({
      isError: false,
      message: "OTP resent successfully.",
    });


  } catch (err) {
    console.log("error log on resend-otp controller:", err);
    res.status(500).send({
      isError: true,
      message: err.message
    });
  }
}



// ========= other needed api for users =========
exports.getAllRoles = (req, res) => {
  // Role.findAll()
  Role.findAll({
    attributes: ['id', 'name'] // Select only id and name
  })
    .then(roles => {
      res.send(roles);
    })
    .catch(err => {
      console.log('Error fetching roles:', err);
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving roles."
      });
    });
};

// ====== get the all users ===
// exports.findAllUsers = (req, res) => {
//   User.findAll()
//     .then(users => {
//       res.send(users);
//     })
//     .catch(err => {
//       console.log("Error fetching users:", err);
//       res.status(500).send({
//         message: err.message || "Some error occurred while retrieving users."
//       });
//     });
// };

exports.findAllUsers = (req, res) => {
  User.findAll({
    where: {
      id: { [Op.ne]: 1 } // Exclude users where id = 1
    }
  })
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      console.error("Error fetching users:", err);
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};

// ===== get particular user ===
exports.findUserById = (req, res) => {
  const id = req.params.id; // Get ID from request params

  User.findByPk(id) // Sequelize method to find by primary key
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }


      console.log("data ddsss:", user);

      res.send(user);
    })
    .catch(err => {
      console.error("Error fetching user by ID:", err);
      res.status(500).send({
        message: "Error retrieving user with id " + id
      });
    });
};

// ======= update user =====
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from request params

    // Check if the user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update user details
    await user.update({
      username: req.body.username,
      mobile_no: req.body.mobile_no,
      email: req.body.email,
      password: req.body.password ? bcrypt.hashSync(req.body.password, 8) : user.password, // Hash new password if provided
      re_password: req.body.re_password,
      address_1: req.body.address_1,
      address_2: req.body.address_2,
      city: req.body.city,
      state_id: req.body.state_id,
      zip_code: req.body.zip_code,
      emp_id: req.body.emp_id,
      status: req.body.status,
      user_role: req.body.user_role,
      property_id: req.body.property_id ? req.body.property_id : null,
      department_id: req.body.department_id ? req.body.department_id : null
    });

    // Update roles if provided
    if (req.body.roles) {
      const roles = await Role.findAll({
        where: {
          name: { [Op.or]: req.body.roles }
        }
      });

      await user.setRoles(roles);
    }

    // If property_id is provided, update user_role in the properties table
    if (req.body.property_id) {
      const property = await Property.findOne({
        where: { id: req.body.property_id },
      });

      if (property) {
        property.user_role = user.id; // Assign user ID to user_role
        await property.save();
      }
    }

    res.status(200).send({ message: "User updated successfully" });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ message: "Error updating user" });
  }
};

// ===== delete user ===
exports.deleteUser = (req, res) => {
  const id = req.params.id;

  // Prevent deletion if id is 1
  if (id == 1) {
    return res.status(403).send({
      message: "User with id=1 cannot be deleted!"
    });
  }

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "success"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Userwith id=" + id
      });
    });
};