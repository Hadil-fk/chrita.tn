# 🌐 chrita.tn

**chrita.tn** is a web platform designed to monitor and manage **LingeConnect**, a smart IoT-based laundry protection system.
🌍 Live website: [https://chrita-tn.vercel.app](https://chrita-tn.vercel.app) The platform provides real-time data visualization, secure access, and system supervision.

---

## ⚙️ LingeConnect (IoT System – Overview)

**LingeConnect** is a **physical IoT system** built around an **ESP32** and environmental sensors to optimize clothes drying and protect laundry from unexpected weather conditions.

📌 **Note:** The hardware layer (ESP32 firmware and sensors) is **not publicly available on GitHub**. This repository focuses on the **web platform** that interacts with the IoT system.

### Hardware Components

* ESP32 microcontroller
* Rain sensor
* DHT22 (Temperature & Humidity)
* Servo motor for clothesline automation

### Communication

* MQTT protocol
* HiveMQ Cloud (managed broker)

---

## 🧠 System Architecture

1. ESP32 collects sensor data (rain, temperature, humidity)
2. Data is published to HiveMQ Cloud via MQTT
3. Backend receives and stores data in MongoDB
4. chrita.tn dashboard displays real-time data securely

---

## 💻 Web Platform Stack

* ⚡ Vite
* ⚛️ React + TypeScript
* 🎨 Tailwind CSS + shadcn-ui
* 🗄️ MongoDB

---

## 🔑 Platform Features

* Secure authentication and user access
* Real-time sensor data visualization
* Monitoring of system status
* Modern, responsive user interface

---

## 🎯 Project Goal

To combine **IoT and modern web technologies** to deliver an intelligent, reliable, and user-friendly solution for everyday laundry protection and automation.

---

## 👩‍💻 Authors

**Hadil Fekih**
Computer Systems Engineering Student
IoT & Embedded Systems 
🔗 GitHub: [https://github.com/Hadil-fk](https://github.com/Hadil-fk)

**Sarra Ayoub**
Computer Systems Engineering Student
IoT & Embedded Systems
🔗 GitHub: [https://github.com/Saraah-Ay](https://github.com/Saraah-Ay)


---

⭐ Feel free to star the repository if you find this project interesting!
