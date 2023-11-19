import dotenv from "dotenv";
import connectDb from "./db/index.js";
dotenv.config({
  path: "./env",
});
connectDb()
  .then(() => {
    app.on("error", (err) => {
      console.log("Error: ", err);
      throw err;
    });
    app.listen(process.env.APP_PORT || 3000, () => {
      console.log(`App Running on http`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB Connection Failed:", err);
  });
const app = express();

// (async()=>{
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//        app.on('error',(error)=>{
//         console.log("Errr:",error);
//         throw error;
//        })

//        app.listen(process.env.APP_PORT,()=>{
//         console.log(`App Listening on ${process.env.APP_PORT}`);
//        })
//     } catch (error) {
//         console.log("Error:", error);
//         throw error
//     }
// })()
