// flow-typed signature: a9c5357026f492c3622bca8c992bd97b
// flow-typed version: 20e8db2d87/@storybook/react_v3.x.x/flow_>=v0.28.x

type NodeModule = typeof module;

declare module '@storybook/react' {
  declare type Renderable = React$Node;
  declare type RenderFunction = (context: Context) => Renderable;
  declare type Context = { kind: string, story: string };

  declare type StoryDecorator = (
    story: RenderFunction,
    context: Context
  ) => Renderable;

  declare interface Story {
    add(storyName: string, callback: RenderFunction): Story,
    addDecorator(decorator: StoryDecorator): Story,
  }

  declare interface StoryObject {
    name: string,
    render: RenderFunction,
  }

  declare interface StoryBucket {
    kind: string,
    stories: Array<StoryObject>,
  }

  declare function addDecorator(decorator: StoryDecorator): void;
  declare function configure(fn: () => void, module: NodeModule): void;
  declare function setAddon(addon: Object): void;
  declare function storiesOf(name: string, module: NodeModule): Story;
  declare function storiesOf<T>(name: string, module: NodeModule): Story & T;
  declare function forceReRender(): void;

  declare function getStorybook(): Array<StoryBucket>;
}
