# ใช้ Node.js image เป็นฐาน
FROM node:18

# กำหนด working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json (ถ้ามี) ไปยัง working directory
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์โปรเจคทั้งหมดไปยัง working directory
COPY . .

# สร้างแอพพลิเคชั่น (หากใช้ Next.js)
RUN npm run build

# เปิด port 3000
EXPOSE 3000

# รันแอพพลิเคชั่น
CMD ["npm", "start"]
