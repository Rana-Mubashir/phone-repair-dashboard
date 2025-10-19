import axios from 'axios'

async function handleImageUpload(file) {
    try {
        if (!file) {
            console.log("No file found", file)
        }

        const formData = new FormData()

        formData.append("image", file)

        const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/image/upload`, formData)
        if (res) {
            return res?.data?.response?.url
        }

    } catch (error) {
        console.log("error in uploading image", error)
        return null
    }
}


export default handleImageUpload