import mongoose from 'mongoose';
import Issue, { CATEGORIES, STATUSES } from '../models/Issue.js';
import { getIo } from '../sockets/index.js';
import cloudinary from '../config/cloudinary.js';

function serialize(issue) {
  const item = issue.toObject ? issue.toObject() : issue;
  return {
    ...item,
    id: item._id.toString(),
    _id: item._id.toString(),
    upvotedDeviceIds: undefined
  };
}

function parseBbox(bbox) {
  if (!bbox) return null;
  const values = bbox.split(',').map(Number);
  if (values.length !== 4 || values.some(Number.isNaN)) return null;
  const [west, south, east, north] = values;
  return { west, south, east, north };
}

export async function listIssues(req, res, next) {
  try {
    const { category, status, sort, bbox } = req.query;
    const query = {};

    if (category && CATEGORIES.includes(category)) query.category = category;
    if (status && STATUSES.includes(status)) query.status = status;

    const bounds = parseBbox(bbox);
    if (bounds) {
      query.location = {
        $geoWithin: {
          $box: [
            [bounds.west, bounds.south],
            [bounds.east, bounds.north]
          ]
        }
      };
    }

    const sortConfig = sort === 'votes' ? { upvoteCount: -1, createdAt: -1 } : { createdAt: -1 };
    const issues = await Issue.find(query).sort(sortConfig).limit(250);
    res.json(issues.map(serialize));
  } catch (error) {
    next(error);
  }
}

export async function getIssue(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found.' });
    res.json(serialize(issue));
  } catch (error) {
    next(error);
  }
}

export async function createIssue(req, res, next) {
  try {
    const { title, description, category, lat, lng, address = '' } = req.body;
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!req.file) return res.status(400).json({ message: 'Photo is required.' });
    if (!title || title.length > 100) return res.status(400).json({ message: 'Title is required and must be 100 characters or fewer.' });
    if (!description || description.length > 500) return res.status(400).json({ message: 'Description is required and must be 500 characters or fewer.' });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'Invalid category.' });
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ message: 'Valid lat/lng are required.' });

    const uploadResult = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'civicpulse/issues',
        resource_type: 'image',
        transformation: [{ width: 1400, height: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
      }
    );

    const issue = await Issue.create({
      title,
      description,
      category,
      address,
      photoUrl: uploadResult.secure_url,
      photoPublicId: uploadResult.public_id,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    });

    const payload = serialize(issue);
    getIo()?.emit('issue:new', payload);
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
}

export async function toggleUpvote(req, res, next) {
  try {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ message: 'deviceId is required.' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Issue not found.' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found.' });

    const hasVoted = issue.upvotedDeviceIds.includes(deviceId);
    if (hasVoted) {
      issue.upvotedDeviceIds.pull(deviceId);
      issue.upvoteCount = Math.max(0, issue.upvoteCount - 1);
    } else {
      issue.upvotedDeviceIds.push(deviceId);
      issue.upvoteCount += 1;
    }

    await issue.save();

    const payload = { id: issue.id, upvoteCount: issue.upvoteCount, voted: !hasVoted };
    getIo()?.emit('issue:upvoted', { id: issue.id, upvoteCount: issue.upvoteCount });
    res.json(payload);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Issue not found.' });

    const issue = await Issue.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!issue) return res.status(404).json({ message: 'Issue not found.' });

    getIo()?.emit('issue:statusChanged', { id: issue.id, status: issue.status });
    res.json(serialize(issue));
  } catch (error) {
    next(error);
  }
}
