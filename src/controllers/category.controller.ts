import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCategory = asyncHandler( async(req, res) => {
    const { name, description, isActive } = req.body

    if (!name || !description) {
        throw new ApiError(400, "All fields are required")
    }

    // TODO: Complete this controller and more
})