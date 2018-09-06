+++
title = "Wildfly DLL as extension"
description = "Add a DLL lib as extension to wildfly server"
tags = [
    "wildfly",
    "jboss",
    "extension",
    "webserver",
    "java",
]
date = "2018-01-08"
categories = [
    "Server",
]
+++

A very difficult part of a wildfly instance is to use some DLL-files in your different java projects as dependency. If you choose the easy way and include the dll binary in your executable path of your wildfly instance, your war project will crash after an another project try to use the same dll binary. After that cognition you have to go the "hard" way. In this post you are on the right path...

### Create JNI project
Create a new java project an include the dll library to your ressources
```java
public class NativeLib {
    static {
        try {

            // basename of mylib.dll (Windows)/mylib.so (Linux)
            System.loadLibrary("mylib"); 

        } catch (UnsatisfiedLinkError e) {
            e.printStackTrace();
        }
    }

    // native method
    public static native void helloWorld(); 

}
```
Create a jar file of this project and import it to your maven repository optionaly:
```bash
mvn install:install-file -Dfile=nativelib-1.0-SNAPSHOT.jar -DgroupId=com.mygroup -DartifactId=nativelib -Dversion=1 -Dpackaging=jar
```
### Import JAR as wildfly module
Create a module folder in the `$JBOSS_HOME` dir and copy your JAR-file there:
```bash
mkdir -p $JBOSS_HOME/modules/com/mygroup/nativelib/main
```

Your DLL-File needs to be copied in the right dir [[1]](https://jboss-modules.github.io/jboss-modules/manual/#native-libraries):
```bash
cp mylib.dll $JBOSS_HOME/modules/com/mygroup/nativelib/main/lib/win-x86_64
```

Now, you have to create a `module.xml` file to register your module:
```xml
<?xml version="1.0" encoding="UTF-8"?>

<module xmlns="urn:jboss:module:1.3" name="com.mygroup.mylib">
  <main-class name="com.mygroup.mylib"/>

    <resources>
        <resource-root path="lib"/>
        <resource-root path="nativelib.jar"/>
    </resources>

</module>
```

### Use wildfly module in war project
To use this wildfly module in your war project, you have to use the JNI-project in your project like as a maven dependency 
```xml
[...]
<dependency>
   <groupId>com.mygroup</groupId>
   <artifactId>nativelib</artifactId>
   <version>1.0.0</version>
</dependency>
[...]
```
At last you have to add the dependency to your `MANIFEST.MF` file of your WAR-file. In maven i.e.:
```xml
<plugin>
       <groupId>org.apache.maven.plugins</groupId>
       <artifactId>maven-war-plugin</artifactId>
       <configuration>
           <archive>
               <manifestEntries>
                    <Dependencies>com.mygroup.nativelib</Dependencies>
               </manifestEntries>
           </archive>
       </configuration>
</plugin>
```

#### Sources
[JBoss Modules](https://jboss-modules.github.io/jboss-modules/manual/#native-libraries)
