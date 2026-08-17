import mongoose from "mongoose";
import { Address } from "../models/address.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createAddress = asyncHandler( async(req, res) => {
    const { firstName, lastName, phone, zipCode, state, city, landmark, street, addressType, isDefault } = req.body

    const requiredFields = [firstName, phone, zipCode, state, city, street, addressType]

    if (requiredFields.some(field => !field?.trim())) {
        throw new ApiError(400, "All required fields are required")
    }
    const existedAddress = await Address.findOne({ 
        user: req.user._id,
        zipCode,
        addressType,
        state,
        city,
        street
    });

    if (existedAddress) {
        throw new ApiError(400, "Address already exists")
    }

    const address = await Address.create({
            user: req.user._id,
            firstName,
            lastName: lastName ?? "",
            phone,
            zipCode,
            state,
            city,
            street,
            landmark: landmark ?? "",
            country: "India",
            addressType,
            isDefault: isDefault ?? false
        })
        
    if (!address) {
        throw new ApiError(500, "Something went wrong while creating address");
    }
    
    return res.status(201).json(
        new ApiResponse(201, address, `Address created successfully`)
    )
})

const getAddresses = asyncHandler( async(req, res) => {
    const addresses = await Address.find({ user: req.user._id });

    if (addresses.length === 0) {
        throw new ApiError(404, "No addresses found");
    }

    return res.status(200).json(
        new ApiResponse(200, addresses, "Addresses fetched successfully")
    )
})

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    if (!mongoose.isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid address ID");
    }

    const address = await Address.findOneAndDelete({
        _id: addressId,
        user: req.user._id
    });

    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Address deleted successfully"
        )
    );
});

export {
    createAddress,
    getAddresses,
    deleteAddress
}