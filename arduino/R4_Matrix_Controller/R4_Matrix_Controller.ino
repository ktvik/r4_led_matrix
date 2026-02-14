/**
 * ARDUINO UNO R4 WIFI - ONBOARD MATRIX VERSJON
 * Bruker det offisielle ArduinoBLE-biblioteket og ArduinoGraphics.
 */

#include <ArduinoBLE.h>
#include <ArduinoGraphics.h>    // MÅ inkluderes før Arduino_LED_Matrix
#include <Arduino_LED_Matrix.h>

ArduinoLEDMatrix matrix;

const char* serviceUUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const char* characteristicUUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

BLEService ledService(serviceUUID);
BLEStringCharacteristic commandChar(characteristicUUID, BLEWrite | BLENotify, 32);

String currentText = "HEI";
int scrollSpeed = 50;
bool scrollLeft = true;

void setup() {
  Serial.begin(9600);
  matrix.begin();
  
  if (!BLE.begin()) {
    Serial.println("Kunne ikke starte Bluetooth!");
    while (1);
  }

  BLE.setLocalName("UnoR4_Bluetooth");
  BLE.setAdvertisedService(ledService);
  ledService.addCharacteristic(commandChar);
  BLE.addService(ledService);
  BLE.advertise();

  Serial.println("Bluetooth klar!");
  updateMatrix();
}

void loop() {
  BLEDevice central = BLE.central();
  if (central) {
    while (central.connected()) {
      if (commandChar.written()) {
        processCommand(commandChar.value());
      }
    }
  }
}

void processCommand(String cmd) {
  cmd.trim();
  if (cmd.startsWith("T:")) currentText = cmd.substring(2);
  else if (cmd.startsWith("S:")) scrollSpeed = cmd.substring(2).toInt();
  else if (cmd.startsWith("D:")) scrollLeft = (cmd.substring(2) == "L");
  updateMatrix();
}

void updateMatrix() {
  matrix.beginDraw();
  matrix.stroke(0xFFFFFFFF);
  matrix.textScrollSpeed(map(scrollSpeed, 10, 200, 100, 10)); 
  matrix.textFont(Font_4x6);
  matrix.beginText(0, 1, 0xFFFFFFFF);
  matrix.print("  " + currentText + "  ");
  matrix.endText(scrollLeft ? SCROLL_LEFT : SCROLL_RIGHT);
  matrix.endDraw();
}
