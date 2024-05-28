import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotEnv from 'dotenv';
import { prisma } from '../utils/prisma/prisma.util.js';
import JoiSchemas from '../middlewares/joi.schema.js';
import authMiddleware from '../middlewares/auth.middleware.js';

dotEnv.config();

const { userSchema, signinSchema } = JoiSchemas;
const router = express.Router();

router.post('/sign-up', async (req, res, next) => {
  //1. 이메일, 비밀번호, 비밀번호 확인, 이름을 reqbody로 받는다
  try {
    const validation = await userSchema.validateAsync(req.body);
    const { email, password, name } = validation;
    //2.이메일 중복 확인
    const isExistUser = await prisma.users.findFirst({ where: { email } });
    if (isExistUser) {
      return res
        .status(400)
        .json({ errorMessage: '이미 가입 된 사용자입니다.' });
    }
    //3.비밀번호 암호화, 넣기
    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        email,
        password: hashedpassword,
        name,
      },
    });

    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    next(error);
  }
});

//로그인 api 구현
router.post('/sign-in', async (req, res, next) => {
  try{//1. 검증된 email, password를 body로 전달
  const signinValidation = await signinSchema.validateAsync(req.body);
  const { email, password } = signinValidation;
  //2.전달 받은 email에 해당하는 사용자와 비밀번호 일치를 확인
  const user = await prisma.users.findFirst({ where: { email } });

  if (!email || !(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ errorMessage: '인증 정보가 유효하지 않습니다.' });
  } //3.로그인 성공시 사용자에게 jwt 발급, header에 이름은 authorization, bearer타입으로 jwt 전달
  const token = jwt.sign(
    {
      userId: user.userId,
    },
    'process.env.DATABASE_ENCRYPT',
    { expiresIn: '12h' }
  ); // 이부분은 dotenv로 숨기기!
  res.setHeader('authorization', `Bearer ${token}`);

  return res.status(200).json({ message: '로그인에 성공했습니다.' });
} catch (error) {
  next (error);
}
});

//내 정보 조회 api 구현

//인증미들웨어로 로그인 사용자 검증(토큰)
router.get('/users', authMiddleware, async (req, res, next) => {
 try{
  const { userId } = req.user;
  //2. 로그인 후 데이터 조회
  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: {
      userId: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ data: user });
} catch (error) {
  next (error);
}
});

export default router;
