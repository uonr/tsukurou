{
  description = "Game Server Infrastructure";

  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.nixos-generators = {
    url = "github:nix-community/nixos-generators";
    inputs.nixpkgs.follows = "nixpkgs";
  };
  inputs.home-manager.url = "github:nix-community/home-manager";

  inputs.sweet-home.url = "github:uonr/sweet-home";
  inputs.mooncell.url = "github:uonr/mooncell";

  outputs = { self, nixpkgs, flake-utils, nixos-generators, sweet-home, mooncell
    , home-manager, ... }:
    let
      shell = flake-utils.lib.eachDefaultSystem (system:
        let pkgs = nixpkgs.legacyPackages.${system};
        in { devShells.default = import ./shell.nix { inherit pkgs; }; });
      image = let system = "x86_64-linux";
      in {
        packages.${system} = {
          gce = nixos-generators.nixosGenerate {
            inherit system;
            modules = [
              home-manager.nixosModules.home-manager
              mooncell.nixosModule
              sweet-home.nixosModule
              ./server/configuration.nix
            ];
            format = "gce";
          };
        };
      };
    in shell // image;
}
