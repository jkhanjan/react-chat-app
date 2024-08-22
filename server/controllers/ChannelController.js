import { response } from "express";
import channel from "../models/ChannelModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

export const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;
    const admin = await User.findById(userId);

    if (!admin) {
      return res.status(400).send("Admin user not found");
    }
    const validMembers = await User.find({ _id: { $in: members } });

    if (validMembers.length !== members.length) {
      return res.status(400).send("some members are not valid users");
    }

    const newChannel = new channel({
      name,
      members,
      admin: userId,
    });
    await newChannel.save();
    return res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log(error, "error");
    return req.status(500).send("Internal server error");
  }
};
export const getUserChannel = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await channel
      .find({
        $or: [{ admin: userId }, { members: userId }],
      })
      .sort({ updatedAt: -1 });

    return res.status(201).json({ channels });
  } catch (error) {
    console.log(error, "error");
    return req.status(500).send("Internal server error");
  }
};
export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channeles = await channel
      .findById(channelId)
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "firstName lastName email _id image color",
        },
      });
    if(!channeles){
      return response.status(404).send("channel not found")
    }
    const messages = channeles.messages;
    return res.status(201).json({ messages });
  } catch (error) {
    console.log(error, "error");
    return req.status(500).send("Internal server error");
  }
};
