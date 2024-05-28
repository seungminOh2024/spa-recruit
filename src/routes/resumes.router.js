import express from 'express';
import { prisma } from '../utils/prisma/prisma.util.js';
import JoiSchemas from '../middlewares/joi.schema.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();
const { resumeSchema } = JoiSchemas;

//이력서 생성 api
router.post('/resumes', authMiddleware, async (req, res, next) => {
  try{//1. 작성자 id는 req.user로 받기
  const { userId } = req.user;
  //2. 유효성 검사 끝난 제목, 자기소개를 body로 받기
  const validation = await resumeSchema.validateAsync(req.body);
  const { title, content } = validation;

  const resume = await prisma.resumes.create({
    data: {
      UserId: userId,
      title,
      content,
    },
  });

  return res.status(201).json({ data: resume });
} catch (error) {
    next(error);
}
});

//이력서 목록조회 api

router.get('/resumes/:UserId', authMiddleware, async (req, res, next) => {
  try{
    const { userId } = req.user;
    const { UserId } = req.params;

    if (parseInt(UserId) !== userId) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

  const sortBy = (req.query.sort || 'desc').toUpperCase();
  const sortOption = sortBy === 'asc' ? 'asc' : 'desc';

  const resumes = await prisma.resumes.findMany({
    where: { UserId: + userId },
    select: {
      resumeId: true,
      title: true,
      content: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      User: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: sortOption },
  });
  if (!resumes) {
    return res.status(200).json([]);
  }

  return res.status(200).json({ data: resumes });
} catch (error){
  console.error('Resume 목록조회 오류:', error);
    next (error);
}
});

//이력서 상세 조회

router.get('/resumes/:UserId/:resumeId', authMiddleware, async (req, res, next) => {
  try{
    const { userId } = req.user;
  const { resumeId } = req.params;
  const resume = await prisma.resumes.findFirst({
    where: {
      UserId: +userId,
      resumeId: +resumeId,
    },
    select: {
      resumeId: true,
      title: true,
      content: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      User: {
        select: {
          name: true,
        },
      },
    },
  });
  if (!resume) {
    return res
      .status(404)
      .json({ errorMessage: '이력서가 존재하지 않습니다.' });
  }

  return res.status(200).json({ data: resume });
} catch (error) {
    next (error);
}
});

//이력서 수정 api
router.put('/resumes/:UserId/:resumeId', authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { resumeId } = req.params;
  const { title, content } = req.body;
  if (!title && !content) {
    return res
      .status(400)
      .json({ errorMessage: '수정할 정보를 입력해 주세요.' });
  }
  try{
  const resume = await prisma.resumes.findFirst({
    where: {
      UserId: +userId,
      resumeId: +resumeId,
    },
  });
  if (!resume) {
    return res
      .status(404)
      .json({ errorMessage: '이력서가 존재하지 않습니다.' });
  }

  const updatedResume = await prisma.resumes.update({
    data: {
      title: title ? title : resume.title,
      content: content ? content : resume.content,
    },
    where: { resumeId: +resumeId },
    select: {
      resumeId: true,
      UserId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ data: {
    resumeId: updatedResume.resumeId,
        userId: updatedResume.UserId,
        status: updatedResume.status,
        title: updatedResume.title,
        content: updatedResume.content,
        createdAt: updatedResume.createdAt,
        updatedAt: updatedResume.updatedAt,
        message: '이력서 수정이 완료되었습니다.',
  },
   });
} catch (error) {
    next (error);
}
});

//이력서 삭제 
router.delete('/resumes/:UserId/:resumeId', authMiddleware, async (req, res, next) => {
    try{
    const { userId } = req.user;
    const { resumeId } = req.params;

const resume = await prisma.resumes.findFirst({
    where:{
        resumeId: + resumeId,
        UserId: +userId,
    },
});

if(!resume) {
    return res.status(404).json({errorMessage: '이력서가 존재하지 않습니다.'});
}

await prisma.resumes.delete({
    where: {resumeId: +resumeId}
});

return res.status(200).json({message: '이력서 삭제가 완료되었습니다.'})
    } catch (error) {
        next (error);
    }
});


export default router;
