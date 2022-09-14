import { Meta, Story } from "@storybook/angular";

import { BannerComponent } from "./banner.component";

export default {
  title: "Component Library/Banner",
  component: BannerComponent,
  args: {
    bannerType: "warning",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=4369%3A16686",
    },
  },
} as Meta;

const Template: Story<BannerComponent> = (args: BannerComponent) => ({
  props: args,
  template: `
    <bit-banner [bannerType]="bannerType">Content Really Long Text Lorem Ipsum Ipsum Ipsum <button>Button</button></bit-banner>
  `,
});

export const Premium = Template.bind({});
Premium.args = {
  bannerType: "premium",
};

export const Info = Template.bind({});
Info.args = {
  bannerType: "info",
};

export const Warning = Template.bind({});
Warning.args = {
  bannerType: "warning",
};

export const Danger = Template.bind({});
Danger.args = {
  bannerType: "danger",
};
