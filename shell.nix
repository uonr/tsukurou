{ pkgs ? import <nixpkgs> { } }:
with pkgs;
mkShell {
  buildInputs = [
    (pulumi.withPackages (ps: [ ps.pulumi-language-nodejs ]))
    nodejs
    google-cloud-sdk
  ];

  shellHook = "";
}
