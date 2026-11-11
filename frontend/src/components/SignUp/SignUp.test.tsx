import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadImage } from "../../services/imageService";
import { createUser, getCurrentUser, loginUser } from "../../services/userService";
import { TOKEN } from "../../utils/localStorage";
import SignUp from "./index";

vi.mock("../../services/imageService", () => ({ uploadImage: vi.fn() }));
vi.mock("../../services/userService", () => ({
  createUser: vi.fn(),
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
}));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

const renderSignUp = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/signup"]}>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="/" element={<p>Main page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return queryClient;
};

const submitForm = () => {
  fireEvent.change(screen.getByPlaceholderText("Your username."), { target: { value: "writer" } });
  fireEvent.change(screen.getByPlaceholderText("Your display name."), { target: { value: "Writer" } });
  fireEvent.change(screen.getByPlaceholderText("Your password."), { target: { value: "password" } });
  const fileInput = document.querySelector('input[type="file"]');
  if (!fileInput) throw new Error("File input not found");
  fireEvent.change(fileInput, { target: { files: [new File(["avatar"], "avatar.png", { type: "image/png" })] } });
  fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
};

describe("SignUp", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading through upload, registration, login and profile loading, then navigates home", async () => {
    const upload = deferred<string>();
    const registration = deferred<object>();
    const authentication = deferred<{ token: string; user: { id: string; username: string } }>();
    const profile = deferred<{ id: string; username: string; name: string; about: string; avatarUrl: string }>();
    vi.mocked(uploadImage).mockReturnValue(upload.promise);
    vi.mocked(createUser).mockReturnValue(registration.promise);
    vi.mocked(loginUser).mockReturnValue(authentication.promise);
    vi.mocked(getCurrentUser).mockReturnValue(profile.promise);
    const queryClient = renderSignUp();

    submitForm();
    expect(await screen.findByRole("status")).toHaveTextContent("Signing up...");
    expect(screen.getByRole("button", { name: "Signing up..." })).toBeDisabled();
    expect(uploadImage).toHaveBeenCalledTimes(1);

    await act(async () => upload.resolve("avatar-key"));
    await waitFor(() => expect(createUser).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("status")).toHaveTextContent("Signing up...");
    expect(vi.mocked(createUser).mock.calls[0][0]).toEqual(
      expect.objectContaining({ username: "writer", avatarUrl: expect.stringContaining("/avatar-key") }),
    );

    await act(async () => registration.resolve({}));
    await waitFor(() => expect(loginUser).toHaveBeenCalledWith("writer", "password"));
    expect(screen.getByRole("status")).toHaveTextContent("Signing up...");

    await act(async () => authentication.resolve({ token: "token", user: { id: "1", username: "writer" } }));
    await waitFor(() => expect(getCurrentUser).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("status")).toHaveTextContent("Signing up...");
    expect(screen.queryByText("Main page")).not.toBeInTheDocument();

    const user = { id: "1", username: "writer", name: "Writer", about: "", avatarUrl: "" };
    await act(async () => profile.resolve(user));
    expect(await screen.findByText("Main page")).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN)).toBe("token");
    expect(queryClient.getQueryData(["me"])).toEqual(user);
  });

  it("stops loading and allows retry when registration fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(uploadImage).mockRejectedValue(new Error("Upload failed"));
    renderSignUp();

    submitForm();
    expect(await screen.findByRole("alert")).toHaveTextContent("Sign up failed. Please try again.");
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(createUser).not.toHaveBeenCalled();
  });

  it("offers login rather than repeating registration when automatic login fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(uploadImage).mockResolvedValue("avatar-key");
    vi.mocked(createUser).mockResolvedValue({});
    vi.mocked(loginUser).mockRejectedValue(new Error("Login failed"));
    renderSignUp();

    submitForm();
    expect(await screen.findByRole("alert")).toHaveTextContent("Your account was created, but automatic login failed.");
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Log in" }));
    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("reports an unsuccessful login response without navigating", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(uploadImage).mockResolvedValue("avatar-key");
    vi.mocked(createUser).mockResolvedValue({});
    vi.mocked(loginUser).mockResolvedValue({ token: "", user: { id: "1", username: "writer" } });
    renderSignUp();

    submitForm();
    expect(await screen.findByRole("alert")).toHaveTextContent("Your account was created, but automatic login failed.");
    expect(screen.queryByText("Main page")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDisabled();
  });
});
