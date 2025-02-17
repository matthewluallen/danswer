"use client";

import { Button, Card, Text, Title } from "@tremor/react";

import {
  CloudEmbeddingProvider,
  CloudEmbeddingModel,
  AVAILABLE_CLOUD_PROVIDERS,
  CloudEmbeddingProviderFull,
  EmbeddingModelDescriptor,
  EmbeddingProvider,
  LITELLM_CLOUD_PROVIDER,
} from "../../../../components/embedding/interfaces";
import { EmbeddingDetails } from "../EmbeddingModelSelectionForm";
import { FiExternalLink, FiInfo } from "react-icons/fi";
import { HoverPopup } from "@/components/HoverPopup";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { LiteLLMModelForm } from "@/components/embedding/LiteLLMModelForm";

export default function CloudEmbeddingPage({
  currentModel,
  embeddingProviderDetails,
  embeddingModelDetails,
  newEnabledProviders,
  newUnenabledProviders,
  setShowTentativeProvider,
  setChangeCredentialsProvider,
  setAlreadySelectedModel,
  setShowTentativeModel,
  setShowModelInQueue,
}: {
  setShowModelInQueue: Dispatch<SetStateAction<CloudEmbeddingModel | null>>;
  setShowTentativeModel: Dispatch<SetStateAction<CloudEmbeddingModel | null>>;
  currentModel: EmbeddingModelDescriptor | CloudEmbeddingModel;
  setAlreadySelectedModel: Dispatch<SetStateAction<CloudEmbeddingModel | null>>;
  newUnenabledProviders: string[];
  embeddingModelDetails?: CloudEmbeddingModel[];
  embeddingProviderDetails?: EmbeddingDetails[];
  newEnabledProviders: string[];
  setShowTentativeProvider: React.Dispatch<
    React.SetStateAction<CloudEmbeddingProvider | null>
  >;
  setChangeCredentialsProvider: React.Dispatch<
    React.SetStateAction<CloudEmbeddingProvider | null>
  >;
}) {
  function hasProviderTypeinArray(
    arr: Array<{ provider_type: string }>,
    searchName: string
  ): boolean {
    return arr.some(
      (item) => item.provider_type.toLowerCase() === searchName.toLowerCase()
    );
  }

  let providers: CloudEmbeddingProviderFull[] = AVAILABLE_CLOUD_PROVIDERS.map(
    (model) => ({
      ...model,
      configured:
        !newUnenabledProviders.includes(model.provider_type) &&
        (newEnabledProviders.includes(model.provider_type) ||
          (embeddingProviderDetails &&
            hasProviderTypeinArray(
              embeddingProviderDetails,
              model.provider_type
            ))!),
    })
  );
  const [liteLLMProvider, setLiteLLMProvider] = useState<
    EmbeddingDetails | undefined
  >(undefined);

  useEffect(() => {
    const foundProvider = embeddingProviderDetails?.find(
      (provider) =>
        provider.provider_type === EmbeddingProvider.LITELLM.toLowerCase()
    );
    setLiteLLMProvider(foundProvider);
  }, [embeddingProviderDetails]);

  return (
    <div>
      <Title className="mt-8">
        Here are some cloud-based models to choose from.
      </Title>
      <Text className="mb-4">
        These models require API keys and run in the clouds of the respective
        providers.
      </Text>

      <div className="gap-4 mt-2 pb-10 flex content-start flex-wrap">
        {providers.map((provider) => (
          <div key={provider.provider_type} className="mt-4 w-full">
            <div className="flex items-center mb-2">
              {provider.icon({ size: 40 })}
              <h2 className="ml-2  mt-2 text-xl font-bold">
                {provider.provider_type}{" "}
                {provider.provider_type == "Cohere" && "(recommended)"}
              </h2>
              <HoverPopup
                mainContent={
                  <FiInfo className="ml-2 mt-2 cursor-pointer" size={18} />
                }
                popupContent={
                  <div className="text-sm text-text-800 w-52">
                    <div className="my-auto">{provider.description}</div>
                  </div>
                }
                style="dark"
              />
            </div>

            <button
              onClick={() => {
                if (!provider.configured) {
                  setShowTentativeProvider(provider);
                } else {
                  setChangeCredentialsProvider(provider);
                }
              }}
              className="mb-2  hover:underline text-sm cursor-pointer"
            >
              {provider.configured ? "Modify API key" : "Provide API key"}
            </button>
            <div className="flex flex-wrap gap-4">
              {provider.embedding_models.map((model) => (
                <CloudModelCard
                  key={model.model_name}
                  model={model}
                  provider={provider}
                  currentModel={currentModel}
                  setAlreadySelectedModel={setAlreadySelectedModel}
                  setShowTentativeModel={setShowTentativeModel}
                  setShowModelInQueue={setShowModelInQueue}
                  setShowTentativeProvider={setShowTentativeProvider}
                />
              ))}
            </div>
          </div>
        ))}

        <Text className="mt-6">
          Alternatively, you can use a self-hosted model using the LiteLLM
          proxy. This allows you to leverage various LLM providers through a
          unified interface that you control.{" "}
          <a
            href="https://docs.litellm.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Learn more about LiteLLM
          </a>
        </Text>

        <div key={LITELLM_CLOUD_PROVIDER.provider_type} className="mt-4 w-full">
          <div className="flex items-center mb-2">
            {LITELLM_CLOUD_PROVIDER.icon({ size: 40 })}
            <h2 className="ml-2  mt-2 text-xl font-bold">
              {LITELLM_CLOUD_PROVIDER.provider_type}{" "}
              {LITELLM_CLOUD_PROVIDER.provider_type == "Cohere" &&
                "(recommended)"}
            </h2>
            <HoverPopup
              mainContent={
                <FiInfo className="ml-2 mt-2 cursor-pointer" size={18} />
              }
              popupContent={
                <div className="text-sm text-text-800 w-52">
                  <div className="my-auto">
                    {LITELLM_CLOUD_PROVIDER.description}
                  </div>
                </div>
              }
              style="dark"
            />
          </div>
          <div className="w-full flex flex-col items-start">
            {!liteLLMProvider ? (
              <button
                onClick={() => setShowTentativeProvider(LITELLM_CLOUD_PROVIDER)}
                className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm cursor-pointer"
              >
                Provide API URL
              </button>
            ) : (
              <button
                onClick={() =>
                  setChangeCredentialsProvider(LITELLM_CLOUD_PROVIDER)
                }
                className="mb-2 hover:underline text-sm cursor-pointer"
              >
                Modify API URL
              </button>
            )}

            {!liteLLMProvider && (
              <Card className="mt-2 w-full max-w-4xl bg-gray-50 border border-gray-200">
                <div className="p-4">
                  <Text className="text-lg font-semibold mb-2">
                    API URL Required
                  </Text>
                  <Text className="text-sm text-gray-600 mb-4">
                    Before you can add models, you need to provide an API URL
                    for your LiteLLM proxy. Click the &quot;Provide API
                    URL&quot; button above to set up your LiteLLM configuration.
                  </Text>
                  <div className="flex items-center">
                    <FiInfo className="text-blue-500 mr-2" size={18} />
                    <Text className="text-sm text-blue-500">
                      Once configured, you&apos;ll be able to add and manage
                      your LiteLLM models here.
                    </Text>
                  </div>
                </div>
              </Card>
            )}
            {liteLLMProvider && (
              <>
                <div className="flex mb-4 flex-wrap gap-4">
                  {embeddingModelDetails
                    ?.filter(
                      (model) =>
                        model.provider_type ===
                        EmbeddingProvider.LITELLM.toLowerCase()
                    )
                    .map((model) => (
                      <CloudModelCard
                        key={model.model_name}
                        model={model}
                        provider={LITELLM_CLOUD_PROVIDER}
                        currentModel={currentModel}
                        setAlreadySelectedModel={setAlreadySelectedModel}
                        setShowTentativeModel={setShowTentativeModel}
                        setShowModelInQueue={setShowModelInQueue}
                        setShowTentativeProvider={setShowTentativeProvider}
                      />
                    ))}
                </div>

                <Card
                  className={`mt-2 w-full max-w-4xl ${
                    currentModel.provider_type === EmbeddingProvider.LITELLM
                      ? "border-2 border-blue-500"
                      : ""
                  }`}
                >
                  <LiteLLMModelForm
                    provider={liteLLMProvider}
                    currentValues={
                      currentModel.provider_type === EmbeddingProvider.LITELLM
                        ? (currentModel as CloudEmbeddingModel)
                        : null
                    }
                    setShowTentativeModel={setShowTentativeModel}
                  />
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CloudModelCard({
  model,
  provider,
  currentModel,
  setAlreadySelectedModel,
  setShowTentativeModel,
  setShowModelInQueue,
  setShowTentativeProvider,
}: {
  model: CloudEmbeddingModel;
  provider: CloudEmbeddingProviderFull;
  currentModel: EmbeddingModelDescriptor | CloudEmbeddingModel;
  setAlreadySelectedModel: Dispatch<SetStateAction<CloudEmbeddingModel | null>>;
  setShowTentativeModel: Dispatch<SetStateAction<CloudEmbeddingModel | null>>;
  setShowModelInQueue: Dispatch<SetStateAction<CloudEmbeddingModel | null>>;
  setShowTentativeProvider: React.Dispatch<
    React.SetStateAction<CloudEmbeddingProvider | null>
  >;
}) {
  const enabled =
    model.model_name === currentModel.model_name &&
    model.provider_type == currentModel.provider_type;

  return (
    <div
      className={`p-4 w-96 border rounded-lg transition-all duration-200 ${
        enabled
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-300 hover:border-blue-300 hover:shadow-sm"
      } ${!provider.configured && "opacity-80 hover:opacity-100"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">{model.model_name}</h3>
        <a
          href={provider.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
        >
          <FiExternalLink size={18} />
        </a>
      </div>
      <p className="text-sm text-gray-600 mb-2">{model.description}</p>
      {model?.provider_type?.toLowerCase() !=
        EmbeddingProvider.LITELLM.toLowerCase() && (
        <div className="text-xs text-gray-500 mb-2">
          ${model.pricePerMillion}/M tokens
        </div>
      )}
      <div className="mt-3">
        <button
          className={`w-full p-2 rounded-lg text-sm ${
            enabled
              ? "bg-background-125 border border-border cursor-not-allowed"
              : "bg-background border border-border hover:bg-hover cursor-pointer"
          }`}
          onClick={() => {
            if (enabled) {
              setAlreadySelectedModel(model);
            } else if (
              provider.configured ||
              provider.provider_type === EmbeddingProvider.LITELLM
            ) {
              setShowTentativeModel(model);
            } else {
              setShowModelInQueue(model);
              setShowTentativeProvider(provider);
            }
          }}
          disabled={enabled}
        >
          {enabled ? "Selected Model" : "Select Model"}
        </button>
      </div>
    </div>
  );
}
