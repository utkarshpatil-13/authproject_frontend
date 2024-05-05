import mongoose from 'mongoose'

export default async function connectDB(){
    try{
        const connection = (await mongoose.connect(`${process.env.MONGO_URI}`)).connection;

       connection.on('connection', () => {
            console.log("MongoDB connected successfully!");
       })

       connection.on('error', (error) => {
            console.log("MongoDB connection error | Make sure mongodb is running", error);
            process.exit(1);
       })
        
    }
    catch(error){
        console.log("Something went wrong")
        console.log(error);
    }
}