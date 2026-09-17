---
title: "Explanation: Framework Architecture"
description: A multi-chapter conceptual explanation of a UI framework's design principles and core elements.
prev: false
next: false
sidebar:
  order: 8
head:
  - tag: meta
    attrs:
      name: robots
      content: "noindex, nofollow"
---

:::note[Sanitized writing sample]
The framework discussed here is referred to as **Vista** and its backend host platform as **Corebase**; internal class packages have been renamed accordingly. This mirrors the original document's full structure — an overview plus three chapters — in one page.
:::

In this document, you'll get to know Vista's architecture: first [what Vista is](#what-is-vista), then the [design principles](#chapter-1-design-principles) that shaped its foundation, then [the elements of the architecture](#chapter-2-elements-of-the-architecture) and how they fit together, and finally [a chapter](#chapter-3-other-significant-things) on other decisions that don't fit neatly elsewhere.

## What is Vista?

Vista is a configuration-driven server component library that provides the underlying structure for building interactive user interfaces. It supplies the essential building blocks for new components, plus a set of ready-made ones, so that building a new UI component means composing existing pieces rather than starting from nothing.

## Chapter 1: Design Principles

### Modularity and composability

A library meant for building UI components needs to let those components share functionality without redundant effort. In Vista, a single view is composed of functional units called **UIControls**. A UIControl can work alone, or several can work together to form a **view pipeline** — which has two possible execution flows: constructing the model, and writing the response.

### Decoupled writing

Suppose you've built a model and can render it as JSON, but later need the same data as a PDF or spreadsheet export. Rebuilding everything from scratch just to change the output format is wasteful. Vista avoids this by separating model construction from response writing entirely: each UIControl has a **mode** (which builds the model) and a **format** (which writes the response), handled independently. A model built once can be written in multiple formats just by plugging in different writer classes.

### Multiple responses through a single endpoint

Applications commonly need to render the same view differently across web, desktop, and mobile — different interfaces have different capabilities and often need different models entirely. Combined with the need for multiple output formats, this means a UI framework needs two things: the ability to construct different models, and the ability to write responses in different formats, both through one endpoint.

Vista's decoupled writing makes this straightforward: a single view can be associated with multiple modes (different models for different interfaces) and multiple formats per mode (different serializations of a given model). A caller selects a mode and format, and gets the right model in the right shape — through one endpoint.

## Chapter 2: Elements of the Architecture

Vista follows the MVC design pattern. Its concrete elements:

**View UIControl.** The functional unit that composes a view. UIControls can be arranged into a pipeline, and a "pipeline organizer" governs how they're ordered — think of UIControls as pipes, and the organizer as the layout deciding how the pipes connect.

```json
view {
    Calendar {
        uicontrol: {
            mode {
                ...
                format {
                    ...
                }
            }
            uicontrols: [ { mode { ... } }, ... ]
        }
    }
}
```

**View Model.** Holds a view's data with no imposed structure — subclasses shape it to the view's needs. It's the medium of communication between controller and writer:

```java
public class ViewModel implements Serializable, AutoCloseable {
    protected ViewModel(final ViewContext viewContext, UicontrolConfig uiControlConfig) { ... }
    public final void write(VMWriterContext context, OutputStream os) throws VMStreamingException { ... }
}
```

A model can also hold sub-models, useful when a view is composed of multiple UIControls that each need their own piece of state.

**View Context.** Carries the contextual information a view needs to process a request: view name, view configuration, the active mode/format, request parameters, and transient state scoped to the lifetime of a single request.

**Data Source Context.** An intentionally empty interface (`DSContext`) that different data sources implement however suits them — a database-backed context looks nothing like a remote-API-backed one, and that's by design.

**View Controller.** Builds the model. Its one abstract responsibility:

```java
public abstract class ViewController {
    public abstract ViewModel getViewModel(ViewContext viewCtx, final DSContext dsContext)
        throws ViewModelConstructionException;
}
```

**View Model Writer Context.** Carries the contextual information a writer needs to write the response, as a set of attributes — with an optional fallback to the request's view parameters when an attribute isn't found.

**View Model Writer.** Turns a constructed model into a response in a given format, optionally applying theming:

```java
public interface ViewModelWriter {
    void write(ViewModel viewModel, VMWriterContext context, OutputStream outputStream) throws VMStreamingException;
    default Optional<Theme> getTheme(ViewModel viewModel) { ... }
}
```

## Chapter 3: Other Significant Things

**Why HOCON for configuration.** Corebase's predecessor used a hierarchical XML configuration, serialized and stored as a flattened two-dimensional structure in a database — which made it awkward to work with anything genuinely hierarchical. Vista adopted HOCON instead: as a superset of JSON with support for substitutions and a more natural notation, it was a better fit for capturing reusable configuration elements without fighting the format.

**Monolithic vs. modular design.** Nothing stops you from putting all of a view's logic into a single UIControl — Vista doesn't forbid a monolithic design. It's discouraged, though: splitting logic across UIControls with focused responsibilities is what makes the modularity and composability from Chapter 1 actually pay off in practice.

## Where to go from here

The [calendar-view tutorial](../tutorial-calendar-view/) is the most direct way to see these elements in use, and the [datasources explanation](../explanation-datasources/) picks up exactly where `DSContext` left off above.
