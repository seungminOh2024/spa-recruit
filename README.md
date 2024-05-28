Node.js 숙련주차 - 나만의 채용 서비스 백엔드 서버 만들기

##1. 사용설명(api 요청 url)

회원정보 생성 : post/api/sign-up
로그인 : post/api/sign-in
이력서 생성 : post/api/resumes
내 이력서 목록 조회 : get/api/resumes/:UserId/
이력서 상세 조회 : get/api/resumes/:UserId/:resumeId
이력서 수정 : put/api/resumes/:UserId/:resumeId
이력서 삭제 : delete/api/resumes/:UserId/:resumeId


##2. 폴더 구조

.
├── node_modules // Git에는 올라가지 않습니다.
├── prisma
│   └── schema.prisma
├── src
│   ├── middlewarmies
│   │   ├── auth.middleware.js
│   │   ├── error-handler.middleware.js
│   │   └── joi.schema.js
│   ├── routes
│   │   ├── resumes.router.js
│   │   └── users.router.js
│   ├── utils
│   │   └── prisma
│   │       └── prisma.util.js
│   └── app.js
├── .env // Git에는 올라가지 않습니다.
├── .gitattributes
├── .gitignore
├── .prettierrc
├── package.json
├── README.md
└── yarn.lock
