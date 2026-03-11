import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function globalCleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = ['properties', 'sell'];
        const publicDir = path.join(__dirname, '..', 'vite-project', 'public');
        const uploadDir = path.join(__dirname, 'uploads');

        for (const colName of collections) {
            console.log(`Checking collection: ${colName}`);
            const ps = await mongoose.connection.db.collection(colName).find({}).toArray();

            for (const p of ps) {
                if (p.images && Array.isArray(p.images)) {
                    const originalCount = p.images.length;
                    const validImages = p.images.filter(img => {
                        if (!img) return false;
                        let fullPath;
                        if (img.toLowerCase().includes('uploads')) {
                            const cleanPath = img.replace('/uploads/', '').replace('uploads/', '');
                            fullPath = path.join(uploadDir, cleanPath.replace(/\//g, path.sep));
                        } else {
                            const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                            fullPath = path.join(publicDir, cleanPath.replace(/\//g, path.sep));
                        }
                        return fs.existsSync(fullPath);
                    });

                    if (validImages.length !== originalCount) {
                        console.log(`  FIXING "${p.title}": ${originalCount} -> ${validImages.length} images`);
                        await mongoose.connection.db.collection(colName).updateOne(
                            { _id: p._id },
                            { $set: { images: validImages } }
                        );
                    }
                }
            }
        }

        await mongoose.disconnect();
        console.log('GLOBAL CLEANUP COMPLETE');
    } catch (err) {
        console.error('Error:', err);
    }
}

globalCleanup();
