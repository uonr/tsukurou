{ pkgs, ... }: {
  services.factorio = {
    enable = true;
    saveName = "experimental";
    openFirewall = true;
    game-password = "dasiwoyebuzhidao";
    game-name = "Tsukurou";
    description = "Experimental Factorio server";
    admins = [ "miiiikan" ];
  };

  # Restore the save on boot
  systemd.services."factorio-save-restore" = {
    after = [ "network-online.target" ];
    wantedBy = [ "factorio.service" ];
    script = let gsutil = "${pkgs.google-cloud-sdk-gce}/bin/gsutil";
    in ''
      if [ -d /var/lib/factorio/saves ]; then
        exit 0;
      fi

      ${gsutil} cp -r gs://tsukurou-saves/factorio/ /var/lib/private/
      chown -R factorio:factorio /var/lib/private/factorio
    '';
    serviceConfig = { User = "root"; };
  };

  # Backup the save every hour
  systemd.timers."factorio-save-backup" = {
    wantedBy = [ "timers.target" ];
    after = [ "network-online.target" "factorio.service" ];
    timerConfig = {
      OnBootSec = "5m";
      OnUnitActiveSec = "1h";
      Unit = "factorio-save-backup.service";
    };
  };

  systemd.services."factorio-save-backup" = {
    script = let gsutil = "${pkgs.google-cloud-sdk-gce}/bin/gsutil";
    in ''
      set -eu
      ${gsutil} cp /var/lib/private/factorio/player-data.json gs://tsukurou-saves/factorio/
      ${gsutil} -m cp -r /var/lib/private/factorio/saves gs://tsukurou-saves/factorio/
    '';
    serviceConfig = {
      Type = "oneshot";
      User = "root";
    };
  };
}
