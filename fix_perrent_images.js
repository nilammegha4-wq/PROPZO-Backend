import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const publicDir = path.join(__dirname, '..', 'vite-project', 'public');

async function fixPerRentImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const properties = await mongoose.connection.db.collection('properties').find({ category: /Rent/i }).toArray();

        for (const p of properties) {
            console.log(`Checking: ${p.title}`);

            // Extract base name from title or main image
            let baseName = '';
            if (p.title.includes('Meeting Hall')) baseName = 'Cozymeetinghall';
            else if (p.title.includes('Mountain View Villa')) baseName = 'MountainVilla';
            else if (p.title.includes('Event Hall')) baseName = 'Eventhall';
            else if (p.title.includes('Beach Side Villa')) baseName = 'BeachVilla';
            else if (p.title.includes('Conference Hall')) baseName = 'Conferencehall';
            else if (p.title.includes('Guest House')) baseName = 'Guesthouse';
            else if (p.title.includes('Floating Home')) baseName = 'Floatinghome';
            else if (p.title.includes('Farm House')) baseName = 'Farmhouse';
            else {
                // fallback to image name without extension
                const img = p.image || (p.images && p.images[0]);
                if (img) {
                    baseName = path.basename(img, path.extname(img));
                }
            }

            if (baseName) {
                const newImages = [];
                // Check for base.jpg, base2.jpg, base3.jpg
                for (let i = 1; i <= 5; i++) {
                    const suffix = i === 1 ? '' : i;
                    const fileName = `${baseName}${suffix}.jpg`;
                    if (fs.existsSync(path.join(publicDir, fileName))) {
                        newImages.push(`/${fileName}`);
                    }
                }

                if (newImages.length > 0) {
                    console.log(`  Updating images to: ${newImages.join(', ')}`);
                    await mongoose.connection.db.collection('properties').updateOne(
                        { _id: p._id },
                        { $set: { images: newImages, image: newImages[0] } }
                    );
                }
            }
        }

        await mongoose.disconnect();
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
    }
}

fixPerRentImages();
