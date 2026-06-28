# Code signing

RuneSwiss's Windows installers are Authenticode-signed with the shared **"The Corner Spore Code
Signing"** certificate — a self-signed two-tier chain (*Corner Spore Root CA* → *Code Signing* leaf).

## What the signature does and doesn't do

- ✅ The installer and executables carry a verified **"The Corner Spore"** publisher signature.
- ✅ On machines where the **Corner Spore Root CA** (`tcs-root-ca.cer`) is installed in *Trusted Root
  Certification Authorities*, the build is trusted with **no warning**.
- ❌ It does **not** clear Windows **SmartScreen** on the public internet (that needs a CA-issued OV/EV
  certificate). On a fresh machine you'll still see a "Windows protected your PC" prompt → *More info*
  → *Run anyway*.
- ❌ It does nothing for macOS Gatekeeper (no macOS build is shipped).

## Building a signed release locally

The certificate lives outside this repo (it is shared across Corner Spore projects and is never
committed). Point electron-builder at it via environment variables, then run the dist build:

```powershell
$env:CSC_LINK = "C:\path\to\tcs-code-signing.pfx"
$env:CSC_KEY_PASSWORD = "<pfx password>"
npm run dist
```

electron-builder signs automatically and writes the installers to `dist/`:

- `RuneSwiss-Setup-<version>.exe` — NSIS installer (per-user, choose install dir).
- `RuneSwiss-<version>-portable.exe` — portable single-file executable.

Without the `CSC_*` variables, `npm run dist` still produces working **unsigned** installers.

## Verifying a signature

```powershell
Get-AuthenticodeSignature .\dist\RuneSwiss-Setup-0.1.0.exe | Format-List Status, SignerCertificate
```

`Status` should be `Valid` (on a machine trusting the root) or `UnknownError`/`NotTrusted` with the
correct *The Corner Spore* signer on a machine that doesn't have the root CA installed.
