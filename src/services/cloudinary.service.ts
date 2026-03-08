const CLOUD_NAME = "dirqzbfmm";
const UPLOAD_PRESET = "posts_upload";

export const uploadToCloudinary = async (file: File) => {

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error("Error subiendo archivo a Cloudinary");
    }

    const data = await response.json();

    return data.secure_url;
};