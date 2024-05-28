import jwt from 'jsonwebtoken';
import dotEnv from 'dotenv';
import { prisma } from '../utils/prisma/prisma.util.js';

dotEnv.config();

export default async(req, res, next) => {
    try{
        const authorization = req.headers['process.env.DATABASE_AUTH'];
        if(!authorization) throw new Error('인증 정보가 없습니다.');

        const [tokenType, token] = authorization.split(' ');

        if(tokenType !=='Bearer')
            throw new Error('지원하지 않는 인증 방식입니다.');

        const decodedToken = jwt.verify(token, 'process.env.DATABASE_ENCRYPT');
        const userId = decodedToken.userId;

        const user = await prisma.users.findFirst({
            where: {userId: +userId},
        });
        if(!user) {
            res.clearCookie('process.env.DATABASE_AUTH');
            throw new Error('인증 정보와 일치하는 사용자가 없습니다.');
        }
    
         req.user = user;

         next();
    
    } catch (error) {
        res.clearCookie('process.env.DATABASE_AUTH');

        switch(error.name){
            case 'TokenExpiredError':
                return res.status(401).json({message: '인증 정보가 만료되었습니다.'});
            case 'JsonWebTokenError':
                return res.status(401).json({message: '지원하지 않는 인증 방식입니다.'});
            default:
                return res.status(401).json({message: error.message ?? '인증 정보가 유효하지 않습니다.'});
        }
    }
}