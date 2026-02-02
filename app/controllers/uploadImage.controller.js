


exports.uploadImage = (req, res) => {

console.log("datagvgggcggggfcgfcgffxxdxdr/:", req.body);

    if (!req.file) {

        return res.status(200).json({
            isError: true,
            message: "Image is required"
        });
 
    }

    try {

        console.log("file", req.file)

        const imageUrl = `/public/completedTicketImages/${req.file.filename}`

        return res.status(201).json({
            isError: false,
            message: "Image Uploaded successfully.",
            image_url: imageUrl,
        });

    } catch (e) {

        console.log("error on upload image :", e);

        res.status(500).send({
            message: 'Issue with Uploading Image',
        });

    }



}