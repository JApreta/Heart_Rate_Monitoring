/*
  MAX30105 Breakout: Output all the raw Red/IR/Green readings
  By: Nathan Seidle @ SparkFun Electronics
  Date: October 2nd, 2016
  https://github.com/sparkfun/MAX30105_Breakout

  Outputs all Red/IR/Green values.

  Hardware Connections (Breakoutboard to Arduino):
  -5V = 5V (3.3V is allowed)
  -GND = GND
  -SDA = A4 (or SDA)
  -SCL = A5 (or SCL)
  -INT = Not connected

  The MAX30105 Breakout can handle 5V or 3.3V I2C logic. We recommend powering the board with 5V
  but it will also run at 3.3V.

  This code is released under the [MIT License](http://opensource.org/licenses/MIT).
*/

#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"

MAX30105 particleSensor;

#define debug Serial //Uncomment this line if you're using an Uno or ESP
//#define debug SerialUSB //Uncomment this line if you're using a SAMD21

enum Stateys{standby, waitMeas, yesMeas};
//Data Collection Variables
int cReddy = 0, oxy = 0, olDatar[1000], olDatao[1000],cNum = 0, lBeat = 0, cBeat;
//uploading bools
bool jConnect = 1, isConnect = 0;
//Timing Variables
int stTimeh = 6,enTimeh =22,stTimem = 0,enTimem = 0, cTime = 0;
//Variables you might want to change
int betweenMeas = 30;//Set betweenMeas to the time you would like between Measurements(in seconds) 
int lTime = betweenMeas * -1;//Set


int Rate3, oxxxy;

String fullJson;

Stateys cState = standby;
LEDStatus mainBitch(RGB_COLOR_GREY, LED_PATTERN_FADE,LED_PRIORITY_NORMAL,LED_SOURCE_DEFAULT);
LEDStatus wConnect(RGB_COLOR_YELLOW, LED_PATTERN_SOLID,LED_PRIORITY_BACKGROUND,LED_SOURCE_DEFAULT);
LEDStatus sleepyTime(RGB_COLOR_RED, LED_PATTERN_BLINK,LED_PRIORITY_BACKGROUND,LED_SOURCE_DEFAULT);
LEDStatus wMeasure(RGB_COLOR_BLUE, LED_PATTERN_BLINK,LED_PRIORITY_BACKGROUND,LED_SOURCE_DEFAULT);
LEDStatus flashTime(RGB_COLOR_GREEN, LED_PATTERN_SOLID,LED_PRIORITY_BACKGROUND,LED_SOURCE_DEFAULT);

void setup()
{
    debug.begin(9600);
    debug.println("MAX30105 Basic Readings Example");

    // Initialize sensor
    if (particleSensor.begin() == false)
    {
        while (1){
        debug.println("MAX30105 was not found. Please check wiring/power. ");}
        
    }

    //SET LED speed
     sleepyTime.setSpeed(LED_SPEED_FAST);

    //start sensor
    byte ledBrightness = 0xFF; //Options: 0=Off to 255=50mA
    byte sampleAverage = 4; //Options: 1, 2, 4, 8, 16, 32
    byte ledMode = 3; //Options: 1 = Red only, 2 = Red + IR, 3 = Red + IR + Green
    int sampleRate = 50; //Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
    int pulseWidth = 411; //Options: 69, 118, 215, 411
    int adcRange = 16384; //Options: 2048, 4096, 8192, 16384
    particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange); //Configure sensor with these settings

    //Establish Online set Variables
    Particle.variable("Rate",Rate3);
    Particle.variable("Oxxxy", oxxxy);
    Particle.variable("FullJson", fullJson );
}


void loop(){
    switch(cState){
      case standby: 
        if(1){
          if(Time.now() > lTime+betweenMeas){
            cState = waitMeas;
            debug.print("\ntrans to waitMeas");
          }
        }
        break;
      case waitMeas:
        wMeasure.setPriority(LED_PRIORITY_IMPORTANT);
        cTime = millis() + 1000*60*5;//set for the amount of time you want to wait between samples
        while((!takeMeas(&cReddy, &oxy)) && (cTime > millis()));//holds until we have a sample or alloted time has passed
        cState = yesMeas;
        debug.print("\ntrans to yesMeas");
        if(cTime<millis()){//if we actually ran out of time:(
          cState = standby;
          lTime = Time.now();
          debug.print("\ntrans to standby");
        }
        wMeasure.setPriority(LED_PRIORITY_BACKGROUND);
        break;
      case yesMeas:
          //debug print in case of wifi issues
          debug.print("hr found! heartRate = ");
          debug.print(cReddy);
          debug.print("  spo2 = ");
          debug.print(oxy);

          lTime = Time.now();//record data being sent

          if(sendData(cReddy, oxy)){//if our data posts!

            lFlash(RGB_COLOR_GREEN);
            for(int i = 0; i <cNum; i++){
              sendData(olDatar[cNum],olDatao[cNum]);
              delay(1000);
            }
            cNum = 0;
          }else{
            lFlash(RGB_COLOR_YELLOW);
          }
      cState = standby;
      debug.print("\ntrans to standby");

    }
    //debug.print("idk anymore");

}

bool takeMeas(int *reddy, int *oxxy){
  long int bufferLength = 100; //buffer length of 100 stores 4 seconds of samples running at 25sps
  long int spo2, heartRate;
  uint32_t irBuffer[bufferLength], redBuffer[bufferLength];
  int8_t validSPO2, validHeartRate;

  //read the first 100 samples, and determine the signal range
  for (byte i = 0 ; i < bufferLength ; i++)
  {
    while (particleSensor.available() == false) //do we have new data?
      particleSensor.check(); //Check the sensor for new data

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample(); //We're finished with this sample so move to next sample


  }

  //calculate heart rate and SpO2 after first 100 samples (first 4 seconds of samples)
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);
    *reddy = heartRate;
    *oxxy = spo2;


    if(validSPO2 && validHeartRate)
      return 1;
    return 0;  
}

// bool gMeas(int r){
//     //Set minThresh to expieremental values of no finger present
//     int minThresh = 0;
//     int maxThresh = 10000;

//     if((r >= minThresh && r<= maxThresh))
//         return 1;
    
//     return 0;
// }

bool rightTime(){
    if((Time.hour()>=stTimeh)&&(Time.hour()>=stTimem)&&(Time.hour()<=enTimeh)&&(Time.minute()<=enTimem))
        return 1;
    return 0;
}



//Flash the chosen color
void lFlash(int color){
    //Flash the chosen color for .1 before returning to the original color;
    mainBitch.setColor(color);
    mainBitch.setPattern(LED_PATTERN_SOLID);
    delay(100);
    mainBitch.setColor(RGB_COLOR_GREEN);
    mainBitch.setPattern(LED_PATTERN_FADE);
}


//Sending Function
bool sendData(int r, int o){
    Rate3 = r;
    oxxxy = o;
    fullJson = String::format("{Rate\":%d,\"Oxy\":%d,\"Time\":%d:%d:%d, \"Date\":%d\\%d\\%d}", r, o, Time.hour(),Time.minute(),Time.second(),Time.month(), Time.day(),Time.year());
    //publish wil return 0 if send is not successful, return back to main in order to catch errors:0
    if(!Particle.publish("testEvent", String::format("{\"Rate\":%d,\"Oxy\":%d,\"Time\":%d}", r, o, Time.now()))){
      olDatar[cNum] = r;
      cNum++;
      olDatao[cNum] = o;
      return 0;}
    delay(1000);
    // fullJson = String::format("{\"Rate\":%d,\"Oxy\":%d,\"Time\":%d:%d:%d, \"Date\":%d\\%d\\%d}", r, o, Time.hour(),Time.minute(),Time.second(),Time.month(), Time.day(),Time.year());
   
    Serial.print("\njust sent");
    return 1;




}