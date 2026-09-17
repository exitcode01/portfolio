---
title: "Tutorial: Create a Basic Calendar App"
description: A hands-on, multi-part tutorial teaching the fundamentals of a configuration-driven UI framework.
prev: false
next: false
sidebar:
  order: 1
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
Originally written for an internal, configuration-driven server-side UI framework — renamed here as **Vista** — and its companion backend platform, renamed **Corebase**. Product names, internal repository links, and internal build tooling have been redacted or genericized; the tutorial's structure, prose, and code are otherwise as written, in full, exactly as it originally shipped across seven parts.
:::

## Goal

In this tutorial, you'll learn how to create a basic calendar view using **Vista**. Along the way, you'll get a good idea of the various fundamental elements that constitute a Vista view.

You'll learn this by building a basic calendar app. It would look something like the following when it is complete: a calendar grid with today's date highlighted, and a working "Today" button that jumps back to the current month.

## Before you start

The following are prerequisites for the tutorial:

* You have basic knowledge of HTML, CSS, and JS to understand the client-side app.
* You have a working knowledge of a Corebase server. The server side of the app would be accessed through a servlet running on Corebase.
* You have a Corebase server set up that you can use for the purposes of this tutorial.
* You know how to use Vista with Corebase at a basic level.

## Parts involved

This tutorial is made up of seven parts, listed below with a summary of each, followed by the full tutorial itself.

1. **Exploring the calendar app** — see what the calendar app expects from the server.
2. **Ruminating about the server** — work out what kind of Vista view you need.
3. **Constructing the model and controller** — write the Java classes that hold and produce the data.
4. **Writing the response** — implement the writer that turns the model into JSON.
5. **Writing the configuration** — tie controller and writer together with a config file.
6. **Wrapping up the server side** — build, package, and expose the view through a servlet.
7. **Finishing the client** — wire the front end up to the new endpoint.

---

## Part 1: Exploring the calendar app

### Goal

In this part of the tutorial, you'll take a look at the basic calendar app that you'll be using on the client side and get an idea of what it expects from the server.

You could find the code for the calendar app that'll be used in the tutorial's companion repository.

### Step 1: Viewing the rendered calendar

Open `index.html`, the main HTML file for the basic calendar app, directly in your browser and see the rendered calendar.

:::note
Directly opening it in the browser is fine. You don't need to serve it via a web server to see the calendar.
:::

You could play around with it to get an idea of how the interface works. Importantly, note that the "Today" button doesn't do anything yet. By the end of this tutorial, you'll be making it work by getting some *necessary information* from the server.

### Step 2: Making "Today" work

Now, you could open up the `js/main.js` file, the main JavaScript file that backs the basic calendar app. You could find some comments in the file which have `TUTORIAL ITEM` mentioned in them — pointers on what needs to be modified to make the "Today" button work.

Essentially, you need to complete the following JavaScript method:

```js
function getToday() {
    /*
     * TUTORIAL ITEM 1:
     * To make the "Today" button work in the calendar app,
     * you need to fetch the current date from the server here
     * and construct a Date object using the info in the
     * response.
     *
     * Note: the server is expected to return UTC date, month, year.
     */

    // SERVER CALL TO FETCH TODAY GOES HERE

    /*
     * From the server response, set the date, month and year
     * in the created date object.
     */
    // const today = new Date();
    // today.setUTCDate(...);

    /*
     * Beware: month is 0-based
     * i.e, 0 - January, 1 - February, ...
     */
    // today.setUTCMonth(...);
    // today.setUTCFullYear(...);
    // return today;

    return null;
}
```

For that, you need a server component that returns today's date information. You'll look into writing that next.

### What you've learned

You've seen the basic calendar app that you'll be working with and how the information about "Today" needs to be returned by the server to make the "Today" button work. You've also seen where the implementation needs to be filled in.

---

## Part 2: Ruminating about the server

### Goal

In the previous part, you saw that the server needs to return the "Today" information to complete the basic calendar app. In this part, you'll get an overview of how to make the server return that information.

### Step 1: Knowing what is to be built

You'll be using Vista to build the server component. Returning the "Today" information can be achieved by creating a new Vista view. As this view would be for a basic calendar app, let's call it a "calendar view."

### Step 2: Knowing the necessary parts

Any typical view in Vista is made up of three essential elements:

1. **Controller**
2. **Model**
3. **Writer**

Apart from these elements, there's the view configuration, necessary to tie the elements together.

### Step 3: Ruminating on the needs of a calendar view

Let's take a closer look at the relevant snippet from the client app again:

```js {9-12}
function getToday() {
    /*
     * TUTORIAL ITEM 1:
     * ...
     */

    ...

    /*
     * From the server response, set the date, month and year
     * in the created date object.
     */
    // const today = new Date();
    // today.setUTCDate(...);

    /*
     * Beware: month is 0-based
     * i.e, 0 - January, 1 - February, ...
     */
    // today.setUTCMonth(...);
    // today.setUTCFullYear(...);
    // return today;

    ...
}
```

As one could infer from the comment, the date, month, and year information need to be set on the `today` `Date` object. From that, we could infer that the server needs to return the following on each request: **date, month, year**.

### What you've learned

You've seen that you need a Vista view in order to return the response for the client. You've also seen the various parts necessary to build a calendar view, and what is needed from it.

---

## Part 3: Constructing the model and controller

### Goal

In this part, you'll write the model and controller classes for the view.

### Step 1: Writing the model class

```java
import com.example.vista.core.view.ViewModel;
import com.example.vista.core.view.ViewContext;
import com.example.vista.config.UicontrolConfig;

public class CalendarModel extends ViewModel {

    public CalendarModel(final ViewContext viewContext, UicontrolConfig uiControlConfig) {
        super(viewContext, uiControlConfig);
    }

    // TUTORIAL ITEM
    // Member declaration and method definitions go here
}
```

Add the necessary members to the model and also the necessary setter and getter methods.

:::note[Hint]
Members could be number types.
:::

### Step 2: Writing the controller class

```java
import com.example.vista.config.UicontrolConfig;
import com.example.vista.core.datasource.DSContext;
import com.example.vista.core.view.*;

public class CalendarController extends ViewController {

    public CalendarController(UicontrolConfig uiControlConfig) {
        super(uiControlConfig);
    }

    @Override
    public ViewModel getViewModel(ViewContext viewContext, DSContext dsContext) throws ViewModelConstructionException {

        // TUTORIAL ITEM
        // Implementation goes here.

    }

}
```

Fill in `getViewModel` such that an instance of `CalendarModel` is created and its members are initialized with information about today, obtained using standard Java APIs.

Two details matter here that are easy to miss on a first read of the client code: the client expects **UTC** values, and it expects the **month to be 0-based**. Getting either wrong produces a calendar that's subtly off by a day or a month.

:::tip
A Stack Overflow answer on constructing a UTC date in Java should guide you here.
:::

### What you've learned

You've learned to write a model and controller class for the view.

---

## Part 4: Writing the response

### Goal

In this part, you'll implement the writer, responsible for sending the response to the client app. Since the response is consumed in JavaScript, JSON is the natural format.

### Step 1: Knowing a JSON library

Writing the JSON output via Jackson's `ObjectMapper` is relatively easy and straightforward.

### Step 2: Writing the writer class

```java
import com.example.vista.core.view.model.ViewModelWriter;
import com.example.vista.core.view.ViewModel;
import com.example.vista.core.view.model.VMWriterContext;
import com.example.vista.core.view.model.VMStreamingException;

import java.io.IOException;
import java.io.OutputStream;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class CalendarWriter implements ViewModelWriter {

    @Override
    public void write(ViewModel viewModel, VMWriterContext vmWriterContext, OutputStream outputStream) throws VMStreamingException {
        if (viewModel instanceof CalendarModel) {
            CalendarModel model = (CalendarModel) viewModel;
            ObjectMapper objectMapper = new ObjectMapper();

            try {
                objectMapper.writeValue(outputStream, viewModel);
            } catch (JsonGenerationException e) {
                throw new VMStreamingException("Exception when generating JSON for the model", e);
            } catch (JsonMappingException e) {
                throw new VMStreamingException("Exception when mapping members of the model to JSON", e);
            } catch (IOException e) {
                throw new VMStreamingException("Exception occurred when writing the JSON response", e);
            }
        }
    }

}
```

This produces a response like:

```json
{ "date": 1, "month": 1, "year": 2022 }
```

### What you've learned

You've learned to write a writer for the view, responsible for sending the response to the client app.

---

## Part 5: Writing the configuration

### Goal

In this part, you'll write the view configuration necessary to tie the controller and writer of the view together.

### Step 1: Writing the configuration

:::note[About the config]
The configuration format used by Vista is HOCON.
:::

```hocon
view {
    Calendar {
        uicontrol {
            mode.web {
                controller: package.path.here.CalendarController
                format.json.writer: package.path.here.CalendarWriter
            }
        }
    }
}
```

:::note
Replace `package.path.here` with the appropriate package to which your controller and writer classes belong.
:::

### Step 2: Placing the configuration file in the build

Save the configuration in a file with the extension `.yc`. By default, Vista supports two configuration loading strategies: **classpath-based** and **Corebase module-based**.

The build provided by Vista **uses Corebase module-based configuration loading by default**, so you would place the configuration in a Corebase module.

### What you've learned

You've learned to write a configuration file for a view and place it appropriately so that Vista can access it.

---

## Part 6: Wrapping up the server side

### Goal

You'll now do the finishing touches necessary to make the calendar view accessible from the client app.

### Step 1: Placing the classes in the build

The model, controller, and writer classes need to be compiled and placed in the Corebase build's classpath as a JAR. Build them with:

```bash
./gradlew build
```

The generated JAR, `calendar-server.jar`, is found in `build/libs`. Copy it to your Corebase build's library directory.

### Step 2: Ensuring the presence of required libraries

Beyond the framework JARs your build already depends on, the following Jackson JARs are necessary (minimum version 2.17.2): `jackson-core`, `jackson-databind`, `jackson-annotations`.

### Step 3: Knowing the servlet

Vista ships a ready-made JSON servlet, `JSONViewProcessorServlet`. Here's how it gets the model and invokes the writer for a given view name:

```java
protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException {
    String viewName = WebClientUtil.getRequestedPathName(req);
    ViewParams viewParams = WebClientUtil.getViewParams(req);
    resp.setContentType("application/json");

    try {
        ViewContext context =
            ViewContext.newBuilder()
                        .viewName(viewName)
                        .mode("web")
                        .format("json")
                        .viewParams(viewParams)
                        .build();
        context.setTransientState(FrameworkConstants.CONTEXT_DIR, req.getContextPath());
        writeResponse(context, resp);
    } catch (Exception e) {
        throw new ServletException(e);
    }
}

protected void writeResponse(ViewContext viewContext, HttpServletResponse response) throws Exception {
    try (DSContext dsContext = ViewUtil.getDSContext(viewContext)) {
        try (
            ViewModel vm = ViewManager.getViewModel(viewContext, dsContext);
            OutputStream out = response.getOutputStream()
        ) {
            vm.write(VMWriterContext.newInstance(viewContext.viewParams()), out);
        }
    }
}
```

### Step 4: Configuring the servlet

Register the servlet in `web.xml`:

```xml
<servlet>
    <servlet-name>Vista-JSON</servlet-name>
    <servlet-class>com.example.vista.core.view.web.json.JSONViewProcessorServlet</servlet-class>
</servlet>

<servlet-mapping>
    <servlet-name>Vista-JSON</servlet-name>
    <url-pattern>*.json</url-pattern>
</servlet-mapping>
```

### Step 5: Knowing the request endpoint

```
http://<DOMAIN>:<PORT>/<CONTEXT>/Calendar.json
```

:::tip[CORS header]
There's a possibility of the request failing due to missing CORS headers, if your client and server are served from different web servers. Either host the client alongside the server, or return an appropriate CORS header from the server.
:::

### What you've learned

You've placed the compiled classes in the Corebase build classpath, configured the servlet, and now know the request endpoint to use from the client app.

---

## Part 7: Finishing the client

### Goal

In this final part, you'll make changes to the client app to make the "Today" button work.

### Step 1: Using the server response

```js
function getToday() {
    const url = "<endpoint-url>";

    const request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.setRequestHeader("Accept", "application/json");
    request.send(null);

    if (request.status === 200) {
        const response = JSON.parse(request.responseText);
        const today = new Date();
        today.setUTCDate(response.date);
        today.setUTCMonth(response.month);   // 0-based, matches the server's contract
        today.setUTCFullYear(response.year);
        return today;
    }
    // Handle non-200 responses here
}
```

### Step 2: Tweaking the Date construction

Remove the existing definitions for `year`, `month`, and `day` in the calendar's init code, and uncomment the definitions that read from `getToday()` instead — this ensures the correct month renders when the calendar first loads.

### Step 3: Viewing the complete basic calendar app

Open `index.html` again, click "Today," and you should land on the current date.

### What you've learned

You've completed the basic calendar app: a client contract worked out first, and a server built to satisfy exactly that contract.

## What's next

Congratulations — you've completed the tutorial. A few ways to go further: read the [framework's architecture explanation](../explanation-architecture/) to understand the bigger picture behind the pieces you just used, or the [datasources explanation](../explanation-datasources/) for how a real view would fetch data instead of computing it in-memory.
