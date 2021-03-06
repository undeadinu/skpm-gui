// @flow

export type Field = 'projectName' | 'projectType' | 'projectIcon';
export type BuildStep =
  | 'installingCliTool'
  | 'downloadingTemplate'
  | 'installingDependencies'
  | 'personalizingTemplate';

export type Status = 'filling-in-form' | 'building-project' | 'project-created';

export type Step = Field | BuildStep;
