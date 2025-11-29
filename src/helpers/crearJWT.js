import jwt from "jsonwebtoken";



const generarJWT = (idToken,rol)=>{

    return jwt.sign({idToken,rol},process.env.JWT_SECRET,{expiresIn:"1d"})
}


export default  generarJWT

