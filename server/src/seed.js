import 'dotenv/config';
import { connectDb } from './config/db.js';
import Issue from './models/Issue.js';
import mongoose from 'mongoose';

const center = { lat: 23.2599, lng: 77.4126 };

function devices(count) {
  return Array.from({ length: count }, (_, index) => `seed-device-${index + 1}`);
}

const samples = [
  ['Deep pothole near Roshanpura signal', 'Large pothole at the left turn is forcing two-wheelers into fast traffic during evening rush.', 'Pothole', 'Reported', 42, 0.006, -0.008, 'Roshanpura Square', 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1000&q=80'],
  ['Overflowing garbage bins behind market', 'Waste has not been cleared for three days and is spilling onto the lane behind the vegetable stalls.', 'Garbage & Waste', 'In Progress', 36, -0.012, 0.011, 'New Market back lane', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80'],
  ['Streetlight out on lake road', 'A row of streetlights has been off since last week, making this stretch unsafe after 8 pm.', 'Streetlight', 'Reported', 31, 0.018, -0.015, 'Upper Lake promenade', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80'],
  ['Water logging outside bus stop', 'Standing water covers the bus stop entry after every light rain and commuters are stepping into traffic.', 'Water Leakage/Logging', 'Reported', 28, -0.018, -0.01, 'MP Nagar Zone 1', 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?auto=format&fit=crop&w=1000&q=80'],
  ['Broken footpath near school gate', 'Footpath slabs are loose and children are walking on the road during pickup hours.', 'Broken Road/Footpath', 'In Progress', 24, 0.01, 0.018, 'Arera Colony E-4', 'https://images.unsplash.com/photo-1597766353939-003d7597c7c9?auto=format&fit=crop&w=1000&q=80'],
  ['Damaged public bench at park', 'The bench frame is cracked and sharp metal edges are exposed near the walking track.', 'Public Property Damage', 'Resolved', 18, -0.02, 0.019, 'Shahpura Lake Park', 'https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?auto=format&fit=crop&w=1000&q=80'],
  ['Stray dog pack near clinic', 'A group of stray dogs is chasing cyclists in the lane beside the clinic at night.', 'Stray Animals', 'Reported', 22, 0.014, 0.006, '10 Number Market', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80'],
  ['Open utility cover on service road', 'A missing cover has left a deep opening beside parked vehicles and is hard to see after dark.', 'Other', 'Reported', 17, -0.007, -0.022, 'Habibganj service road', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1000&q=80'],
  ['Potholes after pipe repair', 'Multiple small potholes have formed where the road was cut for underground pipe work.', 'Pothole', 'In Progress', 33, 0.026, 0.002, 'Kolar Road', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1000&q=80'],
  ['Construction debris blocking drain', 'Debris from a renovation is blocking the drain and water is backing up into the lane.', 'Garbage & Waste', 'Reported', 16, -0.026, 0.004, 'Bairagarh main lane', 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&w=1000&q=80'],
  ['Flickering streetlight at crossing', 'The light flickers continuously and the crossing is poorly visible to drivers.', 'Streetlight', 'Resolved', 14, 0.004, 0.028, 'Bittan Market crossing', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=80'],
  ['Leak from public water line', 'Clean water has been flowing from the valve chamber through the morning.', 'Water Leakage/Logging', 'In Progress', 27, -0.004, 0.031, 'Gulmohar Colony', 'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=1000&q=80'],
  ['Cracked cycle lane divider', 'Divider blocks are broken and scattered across the cycle lane.', 'Broken Road/Footpath', 'Reported', 11, 0.031, -0.026, 'Smart Road link', 'https://images.unsplash.com/photo-1577760258779-e787a1733016?auto=format&fit=crop&w=1000&q=80'],
  ['Graffiti on public toilet block', 'Fresh paint damage and graffiti were reported near the entry wall.', 'Public Property Damage', 'Reported', 9, -0.03, -0.021, 'Peer Gate area', 'https://images.unsplash.com/photo-1567956155799-f074a4568518?auto=format&fit=crop&w=1000&q=80'],
  ['Cattle blocking traffic island', 'Stray cattle are standing on the roundabout and slowing traffic during peak hours.', 'Stray Animals', 'In Progress', 20, 0.021, 0.026, 'Board Office Square', 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80'],
  ['Loose signboard above sidewalk', 'A municipal signboard is hanging from one side and could fall during strong wind.', 'Other', 'Reported', 13, -0.014, -0.032, 'Jahangirabad', 'https://images.unsplash.com/photo-1524558732667-e30a8ad640b5?auto=format&fit=crop&w=1000&q=80'],
  ['Road edge collapsed after rain', 'The road shoulder has washed away and autos are swerving around the damaged edge.', 'Broken Road/Footpath', 'Reported', 25, 0.036, 0.014, 'Ayodhya Bypass', 'https://images.unsplash.com/photo-1541944743827-e04aa6427c33?auto=format&fit=crop&w=1000&q=80'],
  ['Garbage burning near apartments', 'Residents report evening garbage burning causing smoke across the block.', 'Garbage & Waste', 'Resolved', 19, -0.036, 0.014, 'Katara Hills', 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1000&q=80'],
  ['Pothole at hospital entry ramp', 'Ambulances are slowing sharply because of a broken patch at the entry ramp.', 'Pothole', 'Reported', 39, 0.001, -0.039, 'Hamidia Road', 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1000&q=80'],
  ['Water pooling under flyover', 'Drain inlets are clogged and two lanes under the flyover stay wet all day.', 'Water Leakage/Logging', 'Reported', 21, 0.039, -0.004, 'Rani Kamlapati station road', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80']
];

async function seed() {
  await connectDb();
  await Issue.deleteMany({});

  const now = Date.now();
  const docs = samples.map(([title, description, category, status, upvoteCount, latOffset, lngOffset, address, photoUrl], index) => ({
    title,
    description,
    category,
    status,
    upvoteCount,
    upvotedDeviceIds: devices(upvoteCount),
    photoUrl,
    photoPublicId: `seed-${index + 1}`,
    address,
    location: {
      type: 'Point',
      coordinates: [center.lng + lngOffset, center.lat + latOffset]
    },
    createdAt: new Date(now - (index + 1) * 1000 * 60 * 47),
    updatedAt: new Date(now - index * 1000 * 60 * 21)
  }));

  await Issue.insertMany(docs);
  console.log(`Seeded ${docs.length} CivicPulse issues around Bhopal.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
