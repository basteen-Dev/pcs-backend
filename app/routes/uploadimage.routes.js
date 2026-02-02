const bodyParser = require('body-parser');



module.exports = app => {

    const uploadImageController = require('../controllers/uploadImage.controller');

    const router = require('express').Router();
    const upload = require('../middleware/upload');

    // router.use(bodyParser.json({ limit: '50mb' }));

    // router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    
    // router.use(app.json({ limit: '50mb' }));

    // router.use(app.urlencoded({ limit: '50mb', extended: true }));


    router.post("/image", upload.single('image'), uploadImageController.uploadImage);


    app.use('/api/uploads', router);

}