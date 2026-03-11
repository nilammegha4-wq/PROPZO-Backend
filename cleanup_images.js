import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const publicDir = path.join(__dirname, '..', 'vite-project', 'public');
const uploadDir = path.join(__dirname, 'uploads');

async function cleanupBrokenImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = ['properties', 'sell'];

        for (const colName of collections) {
            console.log(`Checking collection: ${colName}`);
            const ps = await mongoose.connection.db.collection(colName).find({}).toArray();

            for (const p of ps) {
                if (!p.images || !Array.isArray(p.images)) continue;

                const originalCount = p.images.length;
                const validImages = p.images.filter(img => {
                    if (!img) return false;

                    let fullPath;
                    if (img.toLowerCase().includes('uploads')) {
                        // Backend image
                        const cleanPath = img.replace('/uploads/', '').replace('uploads/', '');
                        fullPath = path.join(uploadDir, cleanPath);
                    } else {
                        // Public frontend image
                        const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                        fullPath = path.join(publicDir, cleanPath);
                    }

                    const exists = fs.existsSync(fullPath);
                    if (!exists) {
                        console.log(`  Removing broken image for "${p.title}": ${img}`);
                    }
                    return exists;
                });

                if (validImages.length !== originalCount) {
                    await mongoose.connection.db.collection(colName).updateOne(
                        { _id: p._id },
                        { $set: { images: validImages } }
                    );
                    console.log(`  Updated "${p.title}": ${originalCount} -> ${validImages.length} images.`);
                }
            }
        }

        await mongoose.disconnect();
        console.log('Cleanup complete!');
    } catch (err) {
        console.error('Error:', err);
    }
}

cleanupBrokenImages();
