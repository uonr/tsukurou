{ pkgs, lib, ... }:
let
  username = "root";
  sshKeyFile = pkgs.fetchurl {
    url = "https://meta.sr.ht/~citrus.keys";
    sha256 = "KfUH7R5/ir5Z9BYzQrpJnDpj+MUTKgkjha8rULWKLOo=";
  };
  sshKeys = lib.splitString "\n" (builtins.readFile sshKeyFile);
in {
  users.users.${username} = {
    # isNormalUser = true;
    hashedPassword = "!";
    openssh.authorizedKeys.keys = sshKeys;
  };
  # home-manager.users.${username} = {
  #   home.sweet = {
  #     enable = true;
  #     development = true;
  #     icons = true;
  #     maintenance = true;
  #     prompt = "starship";
  #   };
  # };
}
