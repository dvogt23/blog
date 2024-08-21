+++
title = "Wildfly LDAP integration"
description = "LDAP login possibility for wildfly server"
tags = [
    "wildfly",
    "jboss",
    "ldap",
    "webserver",
    "java",
]
date = "2018-04-02"
categories = [
    "Server",
]
+++

In the past, I spent a lot of time to figuring out, how to add the integrated LDAP module of the wildfly server. To do this, you have to take changes in some different places:

### Wildfly server side
#### Add 'LDAPExtended' module in wildfly configuration
In the first place you have to add a module to your server configuration. Do it like this: 
`Wildfly admin console: Configuration -> Subsystems -> Security -> [Add] Name: "LDAPAuth"` this name will be connected in the `jboss-web.xml` file in your project.

#### Add some configuration parameters to this module
`View` the module configuration and add the following parameters:

```
Name: LDAPAuth
Code: LdapExtended
Flag: required
Module:
Module options:
java.naming.factory.initial=com.sun.jndi.ldap.LdapCtxFactory
java.naming.provider.url=ldap://ldapserver:389
bindDN=CN=Testuser,OU=Groupes,DC=domain,DC=net
bindCredential=password
baseCtxDN=dc=domain,dc=net
rolesCtxDN=OU=Groupes,DC=domain,DC=net
roleFilter=(member={1})
roleAttributeID=memberOf
baseFilter=(sAMAccountName={0})
throwValidateError=true
searchScope=SUBTREE_SCOPE
distinguishedNameAttribute=distinguishedname
roleAttributeIsDN=true
roleNameAttributeID=cn
roleRecursion=1
```

**Hint:** the module options will be hidden after you submit this to your module

After a reload of the server runtime, you must have some similiar in your `$JBOS_HOME/standalone/configuration/standalone.xml` file:
```
 <subsystem xmlns="urn:jboss:domain:security:1.2">
            <security-domains>
            [...]
                <security-domain name="LDAPAuth" cache-type="default">
                    <authentication>
                        <login-module name="LDAPAuth" code="LdapExtended" flag="required">
                            <module-option name="java.naming.factory.initial" value="com.sun.jndi.ldap.LdapCtxFactory"/>
                            <module-option name="java.naming.provider.url" value="ldap://ldapserver:389"/>
                            <module-option name="bindDN" value="CN=Testuser,OU=Groupes,DC=domain,DC=net"/>
                            <module-option name="bindCredential" value="password"/>
                            <module-option name="baseCtxDN" value="dc=domain,dc=net"/>
                            <module-option name="rolesCtxDN" value="OU=Groupes,DC=domain,DC=net"/>
                            <module-option name="roleFilter" value="(member={1})"/>
                            <module-option name="roleAttributeID" value="memberOf"/>
                            <module-option name="baseFilter" value="(sAMAccountName={0})"/>
                            <module-option name="throwValidateError" value="true"/>
                            <module-option name="searchScope" value="SUBTREE_SCOPE"/>
                            <module-option name="distinguishedNameAttribute" value="distinguishedname"/>
                            <module-option name="roleAttributeIsDN" value="true"/>
                            <module-option name="roleNameAttributeID" value="cn"/>
                            <module-option name="roleRecursion" value="1"/>
                        </login-module>
                    </authentication>
                </security-domain>
                <security-domain name="test2322" cache-type="default"/>
            </security-domains>
        </subsystem>
```
 
### Project environment
#### Add a 'jboss-web.xml' file with a connection to the wildfly module in your project
To connect your application to the ldap module you have to add your wildfly server, add a `jboss-web.xml` file to your `WEB-INF` dir:
```
<jboss-web>
    <security-domain>java:/jaas/LDAPAuth</security-domain>
</jboss-web>
```

#### Add a login page in '.jsp' format with a POST request included the username and password for ldap authentication
For a form like authentication method, you have to create some `jsp` files in `html` format to authenticate a user to the wildfly ldap module. Add this `login.jsp` file to your `WEBAPP` dir.
```
<form class="col s12" method="post" action="j_security_check">
    <div class='row'>
        <div class='input-field col s12'>
            <input type='text' name='j_username' id='j_username' placeholder="Username" />
        </div>
    </div>

    <div class='row'>
        <div class='input-field col s12'>
            <input type='password' name='j_password' id='j_password' placeholder="Password" />
        </div>
    </div>

    <br />
    <center>
        <div class='row'>
            <button type='submit' name='btn_login' class='col s12 btn btn-large waves-effect red'>Login</button>
        </div>
    </center>
</form>
```

#### Add a 'web.xml' to your project, if not exist, with some security contraints, like ldap group
To define some security constraints you have to add/create a `web.xml` file in your `WEB-INF` dir of your project with an similiar content:
```
<security-constraint>
    <display-name>Login Form</display-name>
    <web-resource-collection>
        <web-resource-name>HTML-Auth</web-resource-name>
        <description>application security constraints</description>
        <url-pattern>/*</url-pattern>
        <http-method>GET</http-method>
    <http-method>POST</http-method>
    </web-resource-collection>

    <auth-constraint>
        <role-name>LDAPGroup</role-name>
    </auth-constraint>

    <user-data-constraint>
        <transport-guarantee>NONE</transport-guarantee>
    </user-data-constraint>
</security-constraint>

<login-config>
    <auth-method>FORM</auth-method>
    <realm-name>LDAPAuth realm</realm-name>
    <form-login-config>
        <form-login-page>/login.jsp</form-login-page>
        <form-error-page>/loginError.jsp</form-error-page>
    </form-login-config>
</login-config>

<session-config>
    <session-timeout>30</session-timeout>
</session-config>

<error-page>
    <error-code>404</error-code>
    <location>/404.html</location>
</error-page>
<error-page>
    <error-code>403</error-code>
    <location>/403.html</location>
</error-page>

<security-role>
    <role-name>LDAPGroup</role-name>
</security-role>
```

#### Get user principal of ldap authorization
After all this configuration and a successfully login of a user, you could get the username from the `vaadinRequest` in your `UI` like (kotlin): 
```
   override fun init(vaadinRequest: VaadinRequest) {
        vaadinRequest.userPrincipal.name
```

