# Assistant Local Studio intégré à REFUGE

Source réelle : `Amachloukh1/ai-local-text-to-image-generator`, branche `feature/nexus-local-studio`, commit `1c1a86cd3d4540fd9bca5e383fed013aee9227ea`. Le composant React Assistant et son contrat conversations/tâches sont repris dans la page Assistant IA existante, sans iframe distante ni navigation vers 2ki.space.

Adaptation : rendu dans le cadre et les langues de REFUGE ; modèle rapide installé sur CPU ; références des PDF/fiches et contexte de réserve d'eau. Conversations, corbeille et tâches sauvegardées localement dans SQLite. L'API embarquée conserve les chemins `/local-studio/api/conversations`, `/local-studio/api/chat` et `/local-studio/v1/jobs`. Elle utilise le moteur local REFUGE et son verrou commun, avec serveur distant uniquement sur choix explicite.

Le backend Python original dépend du verrou GPU Linux et de modèles image/9B d'une autre machine. Il n'est pas lancé sur ce PC sans GPU : l'adaptateur embarqué reproduit le contrat utilisé par le véritable composant Assistant. Les pages Images et Administration des clés restent dans le projet Studio d'origine. La dictée demande un moteur audio local distinct ; elle n'est pas annoncée comme installée. Les documents TXT/PDF peuvent être lus localement avant envoi à l'assistant.

Les fichiers de conversation et les pièces jointes restent privés et exclus de Git. En mode local aucune donnée n'est envoyée à 2ki.space. Le mode distant facultatif transmet le texte choisi et les passages de référence : son choix doit rester explicite.

Le mode est figé au début de chaque envoi et le sélecteur est verrouillé pendant sa préparation et sa réponse. La provenance locale/distante est conservée avec les messages. Le statut du moteur s'actualise après une tâche. Une réponse longue est bornée dans le contexte du tour suivant.

Validation : 21 tests Node, dont persistance après réouverture de SQLite, réponse longue, provenance et véritable parsing du flux Ollama ; essais Chrome avec génération CPU réelle, rechargement d'une conversation, corbeille/restauration, arabe et téléphone. Le fichier TXT est lu dans le navigateur avant envoi. Les PDF utilisent le worker pdf.js stocké localement ; les extraits doivent tenir dans la limite de message.
