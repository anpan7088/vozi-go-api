Since the `yarn` command is not found, it means Yarn is not installed or it's not in your system’s `PATH`. Let's try a different approach to install Yarn 3.x from scratch, ensuring that it is correctly set up.

### **Step-by-Step Guide to Install Yarn 3.x (without Corepack)**

#### 1. **Install Yarn via npm**

Since the `yarn` command is not available, first install Yarn via npm, but we'll ensure that we immediately upgrade to Yarn 3.x.

```bash
npm install -g yarn
```

#### 2. **Upgrade to Yarn 3.x (Berry)**

Once you have installed Yarn globally, you can upgrade it to the latest Yarn 3.x (Berry) version using the following commands:

```bash
yarn set version berry
```

This command will download and configure Yarn 3.x in your project.

#### 3. **Install the Latest Stable Version**

After setting the version to `berry`, you can install the latest stable version of Yarn:

```bash
yarn set version stable
```

#### 4. **Verify the Installation**

Once everything is set up, check the version of Yarn to confirm it’s 3.x:

```bash
yarn --version
```

#### 5. **Re-add Yarn to PATH (if needed)**

If Yarn still doesn't work after this, it might not be in your system’s `PATH`. Check if Yarn’s global bin directory is in your `PATH` by running:

```bash
echo $PATH
```

If it’s missing, you can add Yarn’s global installation path. For example, if Yarn was installed using npm, it’s usually in:

- **macOS/Linux**: `~/.npm-global/bin` or `/usr/local/bin`
- **Windows**: `C:\Users\<YourUsername>\AppData\Roaming\npm`

You can add this path to your `.bashrc` or `.zshrc`:

For **macOS/Linux**:
```bash
export PATH="$PATH:$(yarn global bin)"
```

For **Windows**:
Add the path to the `Environment Variables` -> `System Variables` -> `Path`.

Let me know if this resolves the issue!