// src/models/Episode.js
import mongoose from 'mongoose';

const episodeSchema = mongoose.Schema(
    {
        anime: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Anime',
            required: true,
        },
        seasonNumber: {
            type: Number,
            required: true,
            default: 1,
        },
        episodeNumber: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
        },
        videoUrl: {
            type: String,
            default: null,
        },
        videoFile: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Episode = mongoose.model('Episode', episodeSchema);

export default Episode;