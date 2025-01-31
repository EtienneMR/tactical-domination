<template>
  <div>
    <TabsProseSection title="Contrôles" icon="i-mdi-keyboard">
      <p>
        Pour déplacer une troupe et la faire se battre, le jeu fonctionne avec
        du glisser-déposer.
      </p>
      <p>
        Pour construire et détruire, il faut sélectionner le bâtisseur puis
        cliquer sur l'emplacement où on veut construire.
      </p>
    </TabsProseSection>

    <TabsProseSection title="Mécaniques Générales" icon="i-mdi-cog">
      <TabsProseParagraph title="Déplacement">
        Sauf indications contraires, les unités se déplacent généralement d'une
        case. Les déplacements peuvent s'effectuer dans tous les sens : avant,
        arrière, côtés et diagonales. Si une troupe se déplace sur une troupe
        alliée, les deux troupes vont échanger leur place à condition que les
        deux puissent encore se déplacer à ce tour.
      </TabsProseParagraph>

      <TabsProseParagraph title="Combat">
        Si une troupe capable de combattre se déplace sur une troupe ennemie,
        elle tue instantanément l'ennemi et prend sa place. Les combats sont
        soumis aux mêmes règles de déplacement concernant les sens dans lesquels
        on peut combattre.
      </TabsProseParagraph>

      <TabsProseParagraph title="Ressources">
        Il existe deux types de ressources :
        <ul>
          <li>
            La <AssetIcon asset="resources:food" label="nourriture" />,
            obtensible sur les
            <AssetIcon asset="buildings:null_wheat" label="champs" /> et les
            <AssetIcon asset="buildings:null_pasture" label="pâturages" /> et
            rapporte 3 par tour par bâtiment contrôlé
          </li>
          <li>
            L'<AssetIcon asset="resources:gold" label="or" />, obtensible sur les
            <AssetIcon asset="buildings:null_mine" label="mines" /> et rapporte
            1 par tour par bâtiment contrôlé
          </li>
        </ul>
        De plus, un château contrôlé produit 3
        <AssetIcon asset="resources:food" label="nourriture" /> par tour. Les
        ressources sont distribuées à la fin du tour du joueur, donc juste avant
        que l'adversaire ne joue. Toutes les troupes sauf les paysans ont un
        coût d'entretien : elles réduisent de 1 par troupe la nourriture gagnée
        en fin de tour.
      </TabsProseParagraph>

      <TabsProseParagraph title="Renvoi de Troupes">
        En double-cliquant sur une troupe qui se trouve sur un château, la
        troupe sera supprimée et les ressources qui ont servi à sa création
        seront récupérées.
      </TabsProseParagraph>
    </TabsProseSection>

    <TabsProseSection title="Les Troupes" icon="i-mdi-sword">
      <TabsProseParagraph title="Château">
        À chaque tour, un
        <AssetIcon asset="buildings:null_castle" label="château" /> peut créer
        autant de troupes que l'on veut tant que la case du château est libre.
        Toutes les troupes sauf les paysans coûtent un
        <AssetIcon asset="resources:gold" label="or" /> en début de partie. Les
        paysans coûtent un
        <AssetIcon asset="resources:food" label="nourriture" /> à la place d'un
        <AssetIcon asset="resources:gold" label="or" />. Le coût de toutes les
        troupes augmente de +1 par troupe du même type déjà sur le terrain.<br />
        <strong>Exemple :</strong> si deux cavaliers sont présents sur le
        terrain, le prochain cavalier coûtera 3
        <AssetIcon asset="resources:gold" label="or" />.<br />
        <strong>Remarque :</strong> chaque château produit trois
        <AssetIcon asset="resources:food" label="nourriture" /> par tour.
      </TabsProseParagraph>

      <TabsProseParagraph title="Mur">
        Les murs se font construire par les bâtisseurs et seuls les bâtisseurs
        peuvent les détruire. Les murs bloquent le mouvement des troupes
        ennemies. Si une troupe se déplace sur un mur appartenant au même joueur
        qu'elle, le mur est détruit. Les murs ne coûtent rien à entretenir.
      </TabsProseParagraph>

      <TabsProseParagraph title="Soldat">
        À chaque tour, un
        <AssetIcon asset="entities:null_melee" label="soldat" /> peut :
        <ul>
          <li>
            Se déplacer d'une case contre une
            <AssetIcon asset="resources:food" label="nourriture" />.
          </li>
          <li>
            Attaquer contre une
            <AssetIcon asset="resources:food" label="nourriture" /> et
            bénéficier d'un deuxième tour.
          </li>
        </ul>
        <strong>Capacité :</strong> les soldats sont immunisés aux archers.
      </TabsProseParagraph>

      <TabsProseParagraph title="Archer">
        À chaque tour, un
        <AssetIcon asset="entities:null_archer" label="archer" /> peut :
        <ul>
          <li>
            Se déplacer d'une case contre un
            <AssetIcon asset="resources:food" label="nourriture" />.
          </li>
          <li>
            Attaquer jusqu'à deux cases de distance sans aller sur la case de la
            troupe ciblée contre un
            <AssetIcon asset="resources:food" label="nourriture" />.
          </li>
        </ul>
        <strong>Remarque :</strong> les archers sont inoffensifs face aux
        soldats.
      </TabsProseParagraph>

      <TabsProseParagraph title="Cavalier">
        À chaque tour, un
        <AssetIcon asset="entities:null_horseman" label="cavalier" /> peut :
        <ul>
          <li>
            Se déplacer d'une case contre un
            <AssetIcon asset="resources:food" label="nourriture" /> et
            bénéficier d'un deuxième tour.
          </li>
          <li>
            Attaquer contre un
            <AssetIcon asset="resources:food" label="nourriture" />.
          </li>
        </ul>
      </TabsProseParagraph>

      <TabsProseParagraph title="Bâtisseur">
        À chaque tour, un
        <AssetIcon asset="entities:null_builder" label="bâtisseur" /> peut :
        <ul>
          <li>
            Construire ou détruire jusqu'à 99 bâtiments contre un
            <AssetIcon asset="resources:food" label="nourriture" /> et/ou
            construire un
            <AssetIcon asset="buildings:null_wall" label="mur" /> à chaque fois,
            puis se déplacer d'une case contre un
            <AssetIcon asset="resources:food" label="nourriture" />.
          </li>
          <li>
            Se déplacer d'une case contre un
            <AssetIcon asset="resources:food" label="nourriture" />.
          </li>
        </ul>
        <strong>Capacité :</strong> si un bâtisseur appartient à un joueur
        n'ayant plus de château, sa prochaine construction sera un château et
        non un mur.<br />
        <strong>Remarque :</strong> les bâtisseurs peuvent détruire les
        obstacles naturels et les bâtiments de ressources ainsi que les châteaux
        ennemis.
      </TabsProseParagraph>

      <TabsProseParagraph title="Paysan">
        À chaque tour, un
        <AssetIcon asset="entities:null_farmer" label="paysan" /> peut :
        <ul>
          <li>
            Se déplacer d'une case contre un
            <AssetIcon asset="resources:food" label="nourriture" />.
          </li>
          <li>
            Attaquer contre un
            <AssetIcon asset="resources:food" label="nourriture" />.
          </li>
        </ul>
        <strong>Capacité :</strong> les paysans ne coûtent rien à entretenir.<br />
        <strong>Capacité :</strong> les paysants sont recrutés à l'aide de
        <AssetIcon asset="resources:food" label="nourriture" /> au lieu de
        l'<AssetIcon asset="resources:gold" label="or" />.
      </TabsProseParagraph>
    </TabsProseSection>

    <TabsProseSection title="Les Terrains" icon="i-mdi-earth">
      <TabsProseParagraph title="Biomes">
        Il existe trois types de biome terrestres n'ayant aucune influence sur
        le jeu : la plaine, la forêt et la roche.
      </TabsProseParagraph>

      <TabsProseParagraph title="Obstacles Naturels">
        Les <AssetIcon asset="buildings:null_mountain" label="montagnes" /> et
        <AssetIcon asset="buildings:null_lake" label="lacs" /> empêchent le
        déplacement.<br />
        <strong>Remarque:</strong> ils peuvent être détruits par les bâtisseurs.
      </TabsProseParagraph>
    </TabsProseSection>
  </div>
</template>
