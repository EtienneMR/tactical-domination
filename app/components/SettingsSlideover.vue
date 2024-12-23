<script setup lang="ts">
import useSettings from "~/game/utils/useSettings";
import manifest from "~~/public/assets/manifest.json";

const isOpen = ref(false);

const settings = useSettings();

const bundles = manifest.bundles
  .map((b) => b.name)
  .toSorted()
  .map((b) => ({
    name: b.charAt(0).toUpperCase() + b.substring(1),
    value: b,
  }));
</script>

<template>
  <div>
    <UButton
      icon="i-mdi-cog"
      aria-label="Paramètres"
      @click="isOpen = true"
      :ui="{ icon: { base: 'flex-shrink-0 hover:animate-spin' } }"
    />

    <USlideover v-model="isOpen">
      <div class="p-4 pb-0 flex-1 flex flex-col gap-4 overflow-y-auto">
        <SlideoverH1>
          <UIcon name="i-mdi-cog" />
          <span class="flex-1">Paramètres</span>
          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            icon="i-mdi-close"
            @click="isOpen = false"
          />
        </SlideoverH1>
        <hr class="text-gray-500" />

        <SlideoverH2><UIcon name="i-mdi-account" />Utilisateur</SlideoverH2>

        <UFormGroup
          label="Pseudo"
          description="Pseudo affiché aux autres joueurs"
        >
          <UInput
            icon="i-mdi-badge-account-horizontal"
            :model-value="settings.username"
            @change="(username) => settings.set('username', username)"
          />
        </UFormGroup>

        <SlideoverH2>
          <UIcon name="i-mdi-format-color-fill" /> Affichage
        </SlideoverH2>

        <UFormGroup
          label="Pack de textures"
          description="Textures affichées en jeu"
        >
          <USelect
            icon="i-mdi-format-color-highlight"
            option-attribute="name"
            @change="(bundle) => settings.set('bundle', bundle)"
            :model-value="settings.bundle"
            :options="bundles"
          />
        </UFormGroup>

        <UFormGroup
          label="Afficher la grille"
          description="Afficher un damier pour faciliter le placement des unitées"
        >
          <USelect
            icon="i-mdi-grid-large"
            option-attribute="name"
            @change="(showGrid) => settings.set('showGrid', showGrid == 'true')"
            :model-value="String(settings.showGrid)"
            :options="[
              { name: 'Oui', value: 'true' },
              { name: 'Non', value: 'false' },
            ]"
          />
        </UFormGroup>

        <UFormGroup
          label="Afficher la portée"
          description="Afficher un indicateur de portée des actions"
        >
          <USelect
            icon="i-mdi-map-marker-right"
            option-attribute="name"
            @change="
              (showRange) => settings.set('showRange', showRange == 'true')
            "
            :model-value="String(settings.showRange)"
            :options="[
              { name: 'Oui', value: 'true' },
              { name: 'Non', value: 'false' },
            ]"
          />
        </UFormGroup>

        <SlideoverH2><UIcon name="i-mdi-plus" /> Avancé</SlideoverH2>

        <UFormGroup
          label="Identifiant"
          description="Identifiant utilisateur"
          help="Avoir le même identifiant sur deux appareils permet de les lier"
        >
          <UInput
            icon="i-mdi-identifier"
            :model-value="settings.uid"
            @change="(uid) => settings.set('uid', uid)"
          />
        </UFormGroup>
      </div>
    </USlideover>
  </div>
</template>
