<?php
/**
 * @license MIT
 *
 * Modified by gravityview on 30-May-2025 using {@see https://github.com/BrianHenryIE/strauss}.
 */

namespace GravityKit\GravityView\Foundation\ThirdParty\Gettext\Languages\Exporter;

class Json extends Exporter
{
    /**
     * {@inheritdoc}
     *
     * @see \GravityKit\GravityView\Foundation\ThirdParty\Gettext\Languages\Exporter\Exporter::getDescription()
     */
    public static function getDescription()
    {
        return 'Build a compressed JSON-encoded file';
    }

    /**
     * {@inheritdoc}
     *
     * @see \GravityKit\GravityView\Foundation\ThirdParty\Gettext\Languages\Exporter\Exporter::supportsFormulasWithAndWithoutParenthesis()
     */
    public static function supportsFormulasWithAndWithoutParenthesis()
    {
        return true;
    }

    /**
     * Return the options for json_encode.
     *
     * @return int
     */
    protected static function getEncodeOptions()
    {
        $result = 0;
        if (defined('\JSON_UNESCAPED_SLASHES')) {
            $result |= \JSON_UNESCAPED_SLASHES;
        }
        if (defined('\JSON_UNESCAPED_UNICODE')) {
            $result |= \JSON_UNESCAPED_UNICODE;
        }

        return $result;
    }

    /**
     * {@inheritdoc}
     *
     * @see \GravityKit\GravityView\Foundation\ThirdParty\Gettext\Languages\Exporter\Exporter::toStringDoWithOptions()
     */
    protected static function toStringDoWithOptions($languages, array $options)
    {
        $list = array();
        foreach ($languages as $language) {
            $item = array();
            $item['name'] = $language->name;
            if (isset($language->supersededBy)) {
                $item['supersededBy'] = $language->supersededBy;
            }
            if (isset($language->script)) {
                $item['script'] = $language->script;
            }
            if (isset($language->territory)) {
                $item['territory'] = $language->territory;
            }
            if (isset($language->baseLanguage)) {
                $item['baseLanguage'] = $language->baseLanguage;
            }
            if (!empty($options['both-formulas'])) {
                $item['formulas'] = array(
                    'standard' => $language->buildFormula(true),
                    'php' => $language->formula,
                );
            } else {
                $item['formula'] = $language->formula;
            }
            $item['plurals'] = count($language->categories);
            $item['cases'] = array();
            $item['examples'] = array();
            foreach ($language->categories as $category) {
                $item['cases'][] = $category->id;
                $item['examples'][$category->id] = $category->examples;
            }
            $list[$language->id] = $item;
        }

        return json_encode($list, static::getEncodeOptions());
    }
}
