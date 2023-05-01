const { default: mongoose } = require("mongoose")

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        if (conn.connection.readyState === 1) {
            console.log("connect successfully")
        } else {
            console.log("connect...", conn)
        }
    } catch (error) {
        console.log("connection fail", error)
        throw new Error(error)
    }
}
module.exports = dbConnect
