const User = require("../models/user")
const asyncHandler = require("express-async-handler")
const {
    generateAccessToken,
    generateRefreshToken,
} = require("../middlewares/jwt")

const register = asyncHandler(async (req, res) => {
    const { email, password, firstname, lastname } = req.body
    if (!email || !password || !firstname || !lastname) {
        return res.status(400).json({
            success: false,
            mes: "Missing inputs",
        })
    }

    const user = await User.findOne({ email })
    if (user) {
        throw new Error("This email have been register")
    } else {
        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true : false,
            mes: newUser ? "Register successfully" : "Something wrong",
        })
    }
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            mes: "Missing inputs",
        })
    }

    //instant
    const response = await User.findOne({ email })
    if (response && (await response.isCorrectPassword(password))) {
        //convert to plant object
        //slice password and role from response
        const { password, role, ...userData } = response.toObject()
        //create accessToken
        const accessToken = generateAccessToken(response._id, role)
        //create refreshtoken
        const refreshToken = generateRefreshToken(response._id)
        //save refreshtoken to db
        await User.findByIdAndUpdate(
            response._id,
            { refreshToken },
            { new: true }
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return res.status(200).json({
            success: true,
            accessToken,
            userData,
        })
    } else {
        throw new Error("Invalid email or password")
    }
})

const getCurrent = asyncHandler(async (req, res) => {
    const { _id } = req.user

    const user = await User.findById(_id).select(
        "-refreshToken -password -role"
    )
    return res.status(200).json({
        success: false,
        result: user ? user : "User not found",
    })
})

module.exports = {
    register,
    login,
    getCurrent,
}
