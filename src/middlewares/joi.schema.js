// /middlewares/joi.schema.js

import Joi from 'joi';

const userSchema = Joi.object({
    name: Joi.string().required().messages({
      'any.required': '사용자 이름을 입력해 주세요.',
      'string.empty': '사용자 이름을 입력해 주세요.'
    }),
    email: Joi.string().email().required().messages({
      'any.required': '이메일을 입력해 주세요.',
      'string.empty': '이메일을 입력해 주세요.',
      'string.email': '이메일 형식이 올바르지 않습니다.'
    }),
    password: Joi.string().min(6).required().messages({
      'any.required': '비밀번호를 입력해 주세요.',
      'string.empty': '비밀번호를 입력해 주세요.',
      'string.min': '비밀번호는 6자리 이상이어야 합니다.'
    }),
    confirmpassword: Joi.any().valid(Joi.ref('password')).required().messages({
      'any.only': '입력한 두 비밀번호가 일치하지 않습니다.',
      'any.required': '비밀번호 확인을 입력해 주세요.'
    })
  });

const signinSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': '이메일을 입력해 주세요.',
    'string.empty': '이메일을 입력해 주세요.',
    'string.email': '이메일 형식이 올바르지 않습니다.'
  }),
  password: Joi.string().required().messages({
    'any.required': '비밀번호를 입력해 주세요.',
    'string.empty': '비밀번호를 입력해 주세요.',
  })
});


  const resumeSchema = Joi.object({
    title: Joi.string().required().messages({
      'any.required': '제목을 입력해 주세요.',
      'string.empty': '제목을 입력해 주세요.'
    }),
    content: Joi.string().min(150).required().messages({
    'any.required': '자기소개를 입력해 주세요.',
    'string.empty': '자기소개를 입력해 주세요.',
    'string.min': '자기소개는 150자 이상 작성해야 합니다.'
  })
  });

  export default {userSchema, signinSchema, resumeSchema};