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
      <div class="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        <UButton
          color="gray"
          variant="ghost"
          size="sm"
          icon="i-mdi-close"
          class="flex sm:hidden absolute end-5 top-5 z-10"
          square
          padded
          @click="isOpen = false"
        />
        <h1 class="flex items-center gap-1 text-lg font-bold">
          <UIcon name="i-mdi-cog" /> Paramètres
        </h1>
        <hr class="text-gray-500" />

        <SlideoverH2 icon="i-mdi-account" label="Utilisateur" />

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

        <SlideoverH2 icon="i-mdi-format-color-fill" label="Affichage" />

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

        <SlideoverH2 icon="i-mdi-plus" label="Avancé" />

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
