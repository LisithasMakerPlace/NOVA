#include <Arduino.h>
#include <svm30.h>
#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <SoftwareSerial.h>
#include "Adafruit_PM25AQI.h"

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "Secrets.h"

#define DELAY 10

void Errorloop(char *mess);
float sound();
void PM();
void read_values();
void KeepTrigger(uint8_t del);
void Errorloop(char *mess);

SVM30 svm;
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
SoftwareSerial pmSerial(12, 14); //RX TX
Adafruit_PM25AQI aqi = Adafruit_PM25AQI();

unsigned long sendDataPrevMillis = 4000;
int count = 0;
bool signupOK = false;

const int samplerate = 50;  //1000/50 = 20Hz
long prepeakToPeak = 15;
int mic1;
int flag = 0;
int PM1, PM25, PM10;
float co2eq, tvoc, temp, hum, A_hum;
float lat, lon;
int read = 0;
String LED_stat;
float db_F;

void setup() {
  Serial.begin(115200);

  pmSerial.begin(9600);
  if (!aqi.begin_UART(&pmSerial)) {
    Serial.println("PPM7003 Not Connected.");
    while (1) delay(10);
  }
  Serial.println("PMS7003 sensor initialized.");

  svm.begin();
  if (svm.probe() == false) Errorloop((char *)"could not detect SVM30 sensors");
  else Serial.println("SVM30-J detected");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("ok");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }
  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  pinMode(2, OUTPUT);
  pinMode(13, OUTPUT);
  digitalWrite(2, LOW); // red
  digitalWrite(13, LOW); // green
}

void loop() {
  db_F = sound();
  PM();
  read_values();
  KeepTrigger(DELAY);
  
  if (co2eq <= 1000 && tvoc <= 100 && PM1 <= 10 && PM25 <= 12 && PM10 <= 54 && db_F <= 55){
    digitalWrite(2, HIGH);
    digitalWrite(13, LOW);
    LED_stat = "Safe";
  } else if ( co2eq >= 2000 || tvoc >= 200 || PM1 >= 20 || PM25 >= 35 || PM10 >= 154 || db_F >= 85){
    digitalWrite(2, LOW);
    digitalWrite(13, HIGH);
    LED_stat = "Hazardous";
  } else{
    analogWrite(2, 50);
    analogWrite(13, 0);
    LED_stat = "Moderate";
  }

  if (Firebase.ready() && signupOK && millis() - sendDataPrevMillis > 4000) {
    if (Firebase.RTDB.setString(&fbdo, "LED", LED_stat)) {
      Serial.print("LED_status : ");
      Serial.println(LED_stat);
    }
    if (Firebase.RTDB.setInt(&fbdo, "PMS7003/PM1", PM1)) {
      Serial.print("PM1 : ");
      Serial.println(PM1);
    }
    if (Firebase.RTDB.setInt(&fbdo, "PMS7003/PM25", PM25)) {
      Serial.print("PM25 : ");
      Serial.println(PM25);
    }
    if (Firebase.RTDB.setInt(&fbdo, "PMS7003/PM10", PM10)) {
      Serial.print("PM10 : ");
      Serial.println(PM10);
    }
    if (Firebase.RTDB.setFloat(&fbdo, "Decibel", db_F)) {
      Serial.print("DB : ");
      Serial.println(db_F);
    }
    if (Firebase.RTDB.setFloat(&fbdo, "SVM30/CO2eq", co2eq)) {
      Serial.print("CO2eq : ");
      Serial.println(co2eq);
    }
    if (Firebase.RTDB.setFloat(&fbdo, "SVM30/TVOC", tvoc)) {
      Serial.print("TVOC : ");
      Serial.println(tvoc);
    }
    if (Firebase.RTDB.setFloat(&fbdo, "SVM30/Humidity", hum)) {
      Serial.print("Humidity : ");
      Serial.println(hum);
    }
    if (Firebase.RTDB.setFloat(&fbdo, "SVM30/Temprature", temp)) {
      Serial.print("Temprature : ");
      Serial.println(temp);
    }
    if (Firebase.RTDB.setFloat(&fbdo, "SVM30/Absolute_Humidity", A_hum)) {
      Serial.print("Absolute Humidity : ");
      Serial.println(A_hum);
    }

    if (Firebase.RTDB.getFloat(&fbdo, "Location/Lat") && read == 0) {
      Serial.print("Latitude: ");
      lat = fbdo.floatData();
      Serial.println(lat, 5);
    }
    if (Firebase.RTDB.getFloat(&fbdo, "Location/Long") && read == 0) {
      Serial.print("Longitude: ");
      lon = fbdo.floatData();
      Serial.println(lon, 5);
      read = 1;
    }
    sendDataPrevMillis = millis();
  }
}

float sound() {
  long startMillis = millis();
  long peakToPeak = 0;
  int signalMax = 0;
  int signalMin = 1024;

  while (millis() - startMillis < samplerate) {
    mic1 = analogRead(A0);
    if (mic1 < 1024) {
      if (mic1 > signalMax) signalMax = mic1;
      else if (mic1 < signalMin) signalMin = mic1;
    }
  }
  peakToPeak = signalMax - signalMin;
  peakToPeak = 0.20001 * peakToPeak + 0.8 * prepeakToPeak;
  prepeakToPeak = peakToPeak;
  float db = 35 * log10(peakToPeak / 0.5);
  return db;
}

void PM() {
  PM25_AQI_Data data;
  while (!aqi.read(&data) && flag == 0) {
    Serial.println("Could not read from PMS7003 sensor");
    flag = 1;
    return;
  }
  if (data.pm10_standard < 6000) PM1 = data.pm10_standard;
  if (data.pm25_standard < 6000) PM25 = data.pm25_standard;
  if (data.pm100_standard < 6000) PM10 = data.pm100_standard;
  flag = 0;
}

void KeepTrigger(uint8_t del) {
  uint8_t w_seconds = del;
  unsigned long startMillis;

  if (w_seconds == 0) w_seconds = 1;
  while (w_seconds--) {
    startMillis = millis();
    if (!svm.TriggerSGP30())
      Errorloop((char *)"Error during trigger waiting");
    while (millis() - startMillis < 1000);
  }
}

void read_values() {
  struct svm_values v;
  if (!svm.GetValues(&v)) Errorloop((char *)"Error during reading values");
  co2eq = v.CO2eq; //ppm
  tvoc = v.TVOC; //ppb
  hum = (float)v.humidity / 1000; //%
  temp = (float)v.temperature / 1000; //c
  A_hum = v.absolute_hum; //g/m3
}

void Errorloop(char *mess) {
  Serial.println(mess);
  Serial.println(F("Program on hold"));
  for (;;) delay(100000);}
