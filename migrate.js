import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URL)
.then(async () => {
    const db = mongoose.connection;
    const Professional = db.collection('professionals');
    
    // Find all professionals where verificationStatus does not exist
    const pros = await Professional.find({ verificationStatus: { $exists: false } }).toArray();
    console.log(`Found ${pros.length} professionals to migrate.`);
    
    let updated = 0;
    for (const pro of pros) {
        const status = pro.isVerified ? 'verified' : 'pending';
        await Professional.updateOne({ _id: pro._id }, { $set: { verificationStatus: status }, $unset: { isVerified: "" } });
        updated++;
    }
    console.log(`Successfully migrated ${updated} professionals.`);
    
    // Also clean up any that might have both
    const double = await Professional.updateMany({ isVerified: { $exists: true } }, { $unset: { isVerified: "" } });
    console.log(`Cleaned up ${double.modifiedCount} professionals.`);
    
    process.exit();
}).catch(console.error);
