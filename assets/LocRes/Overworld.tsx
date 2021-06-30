<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.2" tiledversion="1.3.3" name="Overworld" tilewidth="16" tileheight="16" tilecount="1440" columns="40">
 <image source="Overworld.png" width="640" height="576"/>
 <terraintypes>
  <terrain name="新建地形" tile="0"/>
  <terrain name="新建地形" tile="161"/>
 </terraintypes>
 <tile id="0" terrain="0,0,0,0">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="40">
  <animation>
   <frame tileid="40" duration="200"/>
   <frame tileid="41" duration="200"/>
   <frame tileid="42" duration="200"/>
   <frame tileid="43" duration="200"/>
  </animation>
 </tile>
 <tile id="80">
  <animation>
   <frame tileid="80" duration="200"/>
   <frame tileid="81" duration="200"/>
   <frame tileid="82" duration="200"/>
   <frame tileid="83" duration="200"/>
  </animation>
 </tile>
 <tile id="120" terrain="0,0,0,1">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="121" terrain="0,0,1,1">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="122" terrain="0,0,1,0">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="123">
  <animation>
   <frame tileid="123" duration="200"/>
   <frame tileid="124" duration="200"/>
   <frame tileid="125" duration="200"/>
  </animation>
 </tile>
 <tile id="160" terrain="0,1,0,1">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="161" terrain="1,1,1,1">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="162" terrain="1,0,1,0">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="163">
  <animation>
   <frame tileid="163" duration="200"/>
   <frame tileid="164" duration="200"/>
   <frame tileid="165" duration="200"/>
  </animation>
 </tile>
 <tile id="200" terrain="0,1,0,0">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="201" terrain="1,1,0,0">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="202" terrain="1,0,0,0">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="240" terrain="1,1,1,0">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="241" terrain="1,1,0,1">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="242" terrain="0,0,0,">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="2" x="8.5" y="9.33333">
    <polygon points="3,-1.33333 7.5,-1.33333 7.5,6.66667 -1.5,6.66667 -1.5,2.66667"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="243" terrain="0,0,,">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="0" y="7">
    <polygon points="0,1 16,1 16,9 0,9"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="244" terrain="0,0,,0">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="2" x="0" y="11">
    <polygon points="0,-3 2,-3 8,2 8,5 0,5"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="280" terrain="1,0,1,1">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="281" terrain="0,1,1,1">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
 <tile id="282" terrain="0,,0,">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="7" y="0">
    <polygon points="0,0 0,16 9,16 9,0"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="283">
  <properties>
   <property name="collider" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="284" terrain=",0,,0">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="6.4" y="0">
    <polygon points="1.6,0 1.6,16 -6.4,16 -6.4,0"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="322" terrain="0,,0,0">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="11" y="0">
    <polygon points="-4,0 -4,4 2,8 5,8 5,0"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="323" terrain=",,0,0">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="3" x="0" y="0">
    <polygon points="0,0 0,8 16,8 16,0"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="324" terrain=",0,0,0">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="5" y="0">
    <polygon points="3,0 3,4 -1,8 -5,8 -5,0"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="362" terrain=",,,0">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="7" y="16">
    <polygon points="1,0 1,-8 9,-8 9,-16 -7,-16 -7,0"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="363" terrain=",,0,">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="0" y="6">
    <polygon points="0,2 7,2 7,10 16,10 16,-6 0,-6"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="402" terrain=",0,,">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="6" y="0">
    <polygon points="2,0 2,8 10,8 10,16 -6,16 -6,0"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="403" terrain="0,,,">
  <properties>
   <property name="collider" type="bool" value="true"/>
   <property name="type" type="int" value="1"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="10" y="0">
    <polygon points="-3,0 -3,8 -10,8 -10,16 6,16 6,0"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="405">
  <properties>
   <property name="type" type="int" value="1"/>
  </properties>
 </tile>
</tileset>
