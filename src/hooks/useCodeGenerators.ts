"use client";

import { useMemo } from 'react';
import { useDockerfileStore } from '@/store/useDockerfileStore';
import { useComposeStore } from '@/store/useComposeStore';
import { useKubernetesStore } from '@/store/useKubernetesStore';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { generateDockerfile, generateCompose, generateKubernetes } from '@/utils/generators';

export function useCodeGenerators() {
  const { t } = useTranslation();
  const dockerfileState = useDockerfileStore();
  const composeState = useComposeStore();
  const k8sState = useKubernetesStore();
  const { isFullStack } = useAppStore();

  const dockerfileContent = useMemo(() => {
    return generateDockerfile(dockerfileState, t);
  }, [dockerfileState, t]);

  const composeYamlContent = useMemo(() => {
    return generateCompose(composeState, t);
  }, [composeState, t]);

  const kubernetesYamlContent = useMemo(() => {
    return generateKubernetes(k8sState, t, isFullStack);
  }, [k8sState, t, isFullStack]);

  return { dockerfileContent, composeYamlContent, kubernetesYamlContent };
}
