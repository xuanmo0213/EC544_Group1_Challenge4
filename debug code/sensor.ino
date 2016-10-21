#include<math.h>
int led = D0;
int photoresistor = A0;
int power = A5;
int analogvalue;
double analog;
double temp;
double voltageValue;
const float voltage=3.3;
const float Rs=9.1;
const int B=3950;
const double T1=273.15+25;
const double R1=10;
void setup() {
    pinMode(led,OUTPUT);
    pinMode(photoresistor,INPUT);
    pinMode(power,OUTPUT);
    digitalWrite(power,HIGH);


    Particle.variable("analogvalue", &analogvalue, INT);
    Particle.variable("temp", &temp, DOUBLE);
    Particle.variable("voltageValue", &voltageValue, DOUBLE);
    Particle.function("led",ledToggle);



}

void loop() {
    analogvalue = analogRead(photoresistor);
    analog = analogvalue;
    voltageValue = (analog/4095.00)*3.3;
    double Rt = ((voltage-voltageValue)*Rs)/voltageValue;
    temp = (T1*B)/(B+T1*log(Rt/R1))-273.15;
    Particle.publish("sensor_3", String(temp));
    delay(2000);
}

int ledToggle(String command) {

    if (command=="on") {
        digitalWrite(led,HIGH);
        return 1;
    }
    else if (command=="off") {
        digitalWrite(led,LOW);
        return 0;
    }
    else {
        return -1;
    }

}
