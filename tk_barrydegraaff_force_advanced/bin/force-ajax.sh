#!/bin/bash

for account in `zmprov -l gaa`; do
  zmprov ga $account zimbraPrefClientType
done
