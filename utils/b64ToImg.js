module.exports = (image_data, content_type) => {
    // Here we take the binary image data returned from mongodb
    // In order to use that on the client side, we need to convert it to a base64 string
    const base64Image = btoa(
        new Uint8Array(image_data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
        )
    );
    // We then append that base 64 string to the below string we can use on the frontend
    const imageData = `data:${content_type};base64,${base64Image}`;
    return imageData;
};
