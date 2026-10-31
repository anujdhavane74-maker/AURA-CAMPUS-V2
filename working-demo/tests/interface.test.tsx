// @vitest-environment jsdom
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import App from "../src/App";
beforeAll(() => {
  window.scrollTo = () => {};
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(cleanup);
const go = async (path: string) => {
  await act(async () => {
    window.location.hash = "#" + path;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};
const button = (name: string | RegExp) => screen.getByRole("button", { name });
const click = (el: HTMLElement) => fireEvent.click(el);
const fill = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const selectRole = async (value: string) => {
  fill("Demo role", value);
  await screen.findByRole("heading", {
    name:
      value === "club"
        ? "Hello, Coding Club."
        : value === "student"
          ? "Good to see you, Anuj."
          : "A clear view of campus.",
  });
};
it("runs the founder walkthrough through rendered controls: create, register, attend, review, issue, accept, publish, restore", async () => {
  await go("/demo");
  render(<App />);
  click(button("Enter as Riya"));
  await screen.findByRole("heading", { name: "Hello, Coding Club." });
  click(screen.getByRole("link", { name: "Create an event" }));
  await screen.findByLabelText("Event name");
  fill("Event name", "UI Test Build Lab");
  fill("About the experience", "Build an inclusive campus tool.");
  fill("Venue", "Lab 1");
  fill("Registration capacity", "1");
  fill("Status", "published");
  click(button("Publish event"));
  await screen.findByRole("heading", { name: "UI Test Build Lab" });
  const page = screen.getByRole("link", { name: "Public page" });
  const route = page.getAttribute("href")!.slice(1);
  click(page);
  await screen.findByRole("heading", { name: "Good ideas deserve a day." });
  click(button("Explore as a student"));
  click(await screen.findByRole("button", { name: "Count me in" }));
  await screen.findByText("You’re registered");
  expect(screen.getByText("1 / 1 registered")).toBeTruthy();
  click(button("Cancel registration"));
  click(await screen.findByRole("button", { name: "Count me in" }));
  await screen.findByText("You’re registered");
  await go("/student");
  await screen.findByRole("heading", { name: "Good to see you, Anuj." });
  await selectRole("club");
  await go("/club" + route);
  click(await screen.findByRole("button", { name: "Mark event completed" }));
  click(button("Complete event"));
  const attendance = await screen.findByLabelText(
    "Mark participation for Anuj Dhavane",
  );
  expect((attendance as HTMLInputElement).checked).toBe(false);
  click(attendance);
  click(button("Confirm contribution"));
  fill(
    /What did this student contribute/,
    "Designed and presented the accessible check-in screen.",
  );
  click(button("Review confirmation"));
  expect(
    screen.getByRole("dialog", { name: "Review before confirming" }),
  ).toBeTruthy();
  click(button("Issue confirmation"));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await selectRole("student");
  await go("/student/records");
  const record = () =>
    screen
      .getByRole("heading", { name: "UI Test Build Lab" })
      .closest("article")!;
  const pending = within(record());
  expect(pending.getByText("Pending acceptance")).toBeTruthy();
  click(pending.getByRole("button", { name: "Accept contribution" }));
  await go("/u/anuj-dhavane");
  expect(
    screen.queryByRole("heading", { name: "UI Test Build Lab" }),
  ).toBeNull();
  await go("/student/records");
  click(within(record()).getByLabelText("Show on my public profile"));
  await go("/u/anuj-dhavane");
  await screen.findByRole("heading", { name: "UI Test Build Lab" });
  expect(within(record()).getByText("Club-confirmed")).toBeTruthy();
  expect(screen.getByText("Confirmation revoked")).toBeTruthy();
  await go("/student");
  await selectRole("admin");
  await go("/admin/settings");
  click(await screen.findByRole("button", { name: "Reset demo data" }));
  fill("Confirmation", "RESET");
  click(button("Reset everything"));
  await go("/events");
  expect(
    screen.queryByRole("heading", { name: "UI Test Build Lab" }),
  ).toBeNull();
  expect(
    screen.getByRole("heading", { name: "Campus Build Sprint" }),
  ).toBeTruthy();
}, 20000);
it("edits a student profile, creates a project and previews privacy with rendered controls", async () => {
  await go("/demo");
  render(<App />);
  click(button("Enter as Anuj"));
  await go("/student/profile");
  fill("A line that sounds like you", "Designing for a better campus.");
  click(button("Save profile"));
  await go("/student/projects");
  click(button("Add project"));
  fill("Title", "Signal Garden");
  fill(
    "Description and your contribution",
    "Built a synthetic sensor data visualization.",
  );
  click(button("Save project"));
  await screen.findByRole("heading", { name: "Signal Garden" });
  await go("/u/anuj-dhavane");
  expect(
    screen.getByRole("heading", { name: "Designing for a better campus." }),
  ).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Signal Garden" })).toBeTruthy();
  await go("/student/privacy");
  click(screen.getByLabelText("Show projects"));
  await go("/u/anuj-dhavane");
  expect(screen.queryByRole("heading", { name: "Signal Garden" })).toBeNull();
}, 10000);
